"""Autoevaluaciones de práctica: no son instrumentos pretest/postest de la tesis."""
import secrets
from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Integer, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sympy import Rational

from .models import Exam, ExamQuestion, ExamResponse, now
from .exercises import TOPICS, RESOURCE_VERSION, generate, parse_number


class GenerateExam(BaseModel):
    model_config = ConfigDict(extra='forbid')
    request_id: UUID
    topic: Literal['limits', 'derivatives', 'mixed']
    level: int = Field(ge=1, le=3, strict=True)
    question_count: int = Field(ge=3, le=20, strict=True)


class ExamAnswer(BaseModel):
    model_config = ConfigDict(extra='forbid')
    question_id: str = Field(min_length=1, max_length=40)
    answer: str = Field(max_length=80)


class SubmitExam(BaseModel):
    model_config = ConfigDict(extra='forbid')
    answers: list[ExamAnswer] = Field(max_length=20)


def summary(exam):
    completed = exam.submitted_at is not None
    return {
        'id': exam.id, 'course': exam.course, 'topic': exam.topic, 'level': exam.level,
        'question_count': exam.question_count, 'created_at': exam.created_at,
        'submitted_at': exam.submitted_at, 'status': 'completed' if completed else 'in_progress',
        'attempt_number': 1, 'correct_count': exam.correct_count,
        'incorrect_count': exam.question_count - exam.correct_count if completed else None,
        'answered_count': exam.answered_count,
        'unanswered_count': exam.question_count - exam.answered_count if completed else None,
        'score': round(exam.correct_count / exam.question_count * 20, 2) if completed else None,
        'percentage': round(exam.correct_count / exam.question_count * 100, 2) if completed else None,
        'elapsed_seconds': exam.elapsed_seconds,
    }


def owned_exam(db, exam_id, token):
    exam = db.scalar(select(Exam).where(Exam.id == exam_id, Exam.learner == token))
    if exam is None:
        raise HTTPException(404, 'Examen no encontrado.')
    return exam


def detail(db, exam):
    payload = summary(exam)
    questions = db.scalars(select(ExamQuestion).where(ExamQuestion.exam_id == exam.id).order_by(ExamQuestion.position)).all()
    responses = {}
    if exam.submitted_at:
        responses = {r.question_id: r for r in db.scalars(select(ExamResponse).join(ExamQuestion).where(ExamQuestion.exam_id == exam.id))}
    payload['questions'] = []
    for q in questions:
        item = {key: getattr(q, key) for key in ('id', 'position', 'topic', 'level', 'prompt', 'formula', 'resource_version')}
        if exam.submitted_at:
            r = responses[q.id]
            item.update(answer=r.answer, correct=r.correct, expected=q.expected, explanation=q.explanation)
        payload['questions'].append(item)
    return payload


def generate_exam(db, token, body):
    previous = db.scalar(select(Exam).where(Exam.learner == token, Exam.request_id == str(body.request_id)))
    if previous:
        if (previous.topic, previous.level, previous.question_count) != (body.topic, body.level, body.question_count):
            raise HTTPException(409, 'La solicitud ya se utilizó con otros parámetros. Genera una solicitud nueva.')
        return detail(db, previous)
    exam = Exam(id=secrets.token_hex(16), learner=token, request_id=str(body.request_id), topic=body.topic,
                level=body.level, question_count=body.question_count)
    db.add(exam)
    db.flush()
    seen = set()
    for position in range(1, body.question_count + 1):
        topic = ('limits' if position % 2 else 'derivatives') if body.topic == 'mixed' else body.topic
        for _ in range(1000):
            prompt, formula, expected, _, explanation = generate(topic, body.level)
            if (prompt, formula) not in seen:
                break
        else:
            db.rollback()
            raise HTTPException(503, 'No se pudieron generar preguntas distintas. Inténtalo nuevamente.')
        seen.add((prompt, formula))
        db.add(ExamQuestion(id=secrets.token_hex(16), exam_id=exam.id, position=position, topic=topic,
                            level=body.level, prompt=prompt, formula=formula, expected=expected,
                            explanation=explanation, resource_version=RESOURCE_VERSION))
    db.commit()
    return detail(db, exam)


def submit_exam(db, token, exam_id, body):
    exam = owned_exam(db, exam_id, token)
    questions = db.scalars(select(ExamQuestion).where(ExamQuestion.exam_id == exam.id).order_by(ExamQuestion.position)).all()
    ids = {q.id for q in questions}
    answers = {a.question_id: a.answer.strip() for a in body.answers}
    if len(answers) != len(body.answers):
        raise HTTPException(422, 'Hay preguntas repetidas en el envío.')
    if answers.keys() - ids:
        raise HTTPException(422, 'Las respuestas incluyen preguntas ajenas a este examen.')
    if exam.submitted_at:
        # An identical retry returns the original result. A changed submission is rejected.
        previous = {r.question_id: r.answer for r in db.scalars(select(ExamResponse).join(ExamQuestion).where(ExamQuestion.exam_id == exam.id))}
        if any(answers.get(q.id, '') != previous[q.id] for q in questions):
            raise HTTPException(409, 'Este examen ya fue enviado y no se puede modificar.')
        return detail(db, exam)
    results = []
    for q in questions:
        answer = answers.get(q.id, '')
        try:
            correct = bool(parse_number(answer) == Rational(q.expected)) if answer else False
        except HTTPException as exc:
            raise HTTPException(422, f'Pregunta {q.position}: {exc.detail}')
        results.append((q, answer, correct))
    submitted_at = now()
    seconds = max(0, int((datetime.fromisoformat(submitted_at) - datetime.fromisoformat(exam.created_at)).total_seconds()))
    # Atomic claim: concurrent sends cannot overwrite the result. All responses and
    # aggregates commit in this same transaction; any failure rolls everything back.
    claimed = db.execute(update(Exam).where(Exam.id == exam.id, Exam.submitted_at.is_(None)).values(
        submitted_at=submitted_at, correct_count=sum(r[2] for r in results),
        answered_count=sum(bool(r[1]) for r in results), elapsed_seconds=seconds,
    ).execution_options(synchronize_session=False))
    if claimed.rowcount != 1:
        db.rollback()
        return submit_exam(db, token, exam_id, body)
    for q, answer, correct in results:
        db.add(ExamResponse(question_id=q.id, answer=answer, correct=correct))
    db.commit()
    db.refresh(exam)
    return detail(db, exam)


def exam_metrics(db, token):
    exams = db.scalars(select(Exam).where(Exam.learner == token, Exam.submitted_at.is_not(None)).order_by(Exam.submitted_at, Exam.id)).all()
    count = len(exams)
    questions = sum(e.question_count for e in exams)
    correct = sum(e.correct_count for e in exams)
    answered = sum(e.answered_count for e in exams)
    percentages = [e.correct_count / e.question_count * 100 for e in exams]
    rows = db.execute(select(ExamQuestion.topic, func.count(), func.sum(ExamResponse.correct.cast(Integer))).join(
        ExamResponse, ExamResponse.question_id == ExamQuestion.id).join(Exam, Exam.id == ExamQuestion.exam_id).where(
        Exam.learner == token, Exam.submitted_at.is_not(None)).group_by(ExamQuestion.topic)).all()
    by_topic = [{'topic': topic, 'questions': n, 'correct': int(hits), 'incorrect': n-int(hits), 'percentage': round(hits/n*100, 2)} for topic, n, hits in rows]
    weakest = min(by_topic, key=lambda row: row['percentage']) if by_topic else None
    return {
        'course': 'Cálculo I', 'completed_exams': count,
        'average_score': round(sum(percentages)/count/5, 2) if count else None,
        'average_percentage': round(sum(percentages)/count, 2) if count else None,
        'overall_percentage': round(correct/questions*100, 2) if questions else None,
        'questions': questions, 'answered': answered, 'correct': correct,
        'incorrect': questions-correct, 'unanswered': questions-answered,
        'by_topic': by_topic,
        'timeline': [{'id': e.id, 'submitted_at': e.submitted_at, 'topic': e.topic, 'level': e.level,
                      'question_count': e.question_count, 'score': summary(e)['score'], 'percentage': summary(e)['percentage']} for e in exams],
        'suggestion': (f'Repasa {next(t["title"].lower() for t in TOPICS if t["id"] == weakest["topic"])}: '
                       f'es el tema con menor porcentaje de aciertos en tus autoevaluaciones ({weakest["percentage"]}%).') if weakest else None,
    }


def build_exam_router(db_dependency, learner_dependency):
    router = APIRouter(prefix='/api/exams', tags=['Autoevaluaciones'])
    DB = Annotated[Session, Depends(db_dependency)]
    User = Annotated[str, Depends(learner_dependency)]

    @router.post('', status_code=201)
    def create(body: GenerateExam, db: DB, token: User):
        try:
            return generate_exam(db, token, body)
        except IntegrityError:
            db.rollback()
            # Resolve concurrent generation with the same client request ID.
            if db.scalar(select(Exam).where(Exam.learner == token, Exam.request_id == str(body.request_id))):
                return generate_exam(db, token, body)
            raise

    @router.get('')
    def history(db: DB, token: User, offset: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=50)):
        records = db.scalars(select(Exam).where(Exam.learner == token).order_by(Exam.created_at.desc(), Exam.id).offset(offset).limit(limit))
        total = db.scalar(select(func.count()).select_from(Exam).where(Exam.learner == token))
        return {'items': [summary(exam) for exam in records], 'total': total, 'offset': offset, 'limit': limit}

    @router.get('/metrics')
    def metrics(db: DB, token: User):
        return exam_metrics(db, token)

    @router.get('/{exam_id}')
    def get_exam(exam_id: str, db: DB, token: User):
        return detail(db, owned_exam(db, exam_id, token))

    @router.post('/{exam_id}/submit')
    def submit(exam_id: str, body: SubmitExam, db: DB, token: User):
        return submit_exam(db, token, exam_id, body)

    return router
