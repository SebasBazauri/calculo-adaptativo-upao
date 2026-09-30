"""API de demostración local. No habilitada para investigación con datos reales."""
import csv
import io
import os
import secrets
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, select, event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sympy import Rational
from .models import Base, Learner, Exercise, Attempt
from .exercises import TOPICS, generate, parse_number, level_for, RESOURCE_VERSION
from .migrations import upgrade_schema
from .exams import build_exam_router


class AnswerInput(BaseModel):
    answer: str = Field(min_length=1, max_length=80)


def create_app(database_url=None):
    url = database_url or os.getenv('DATABASE_URL', 'sqlite:///./calculo.db')
    engine = create_engine(url, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {})

    if url.startswith('sqlite'):
        @event.listens_for(engine, 'connect')
        def sqlite_foreign_keys(connection, _):
            connection.execute('PRAGMA foreign_keys=ON')

    @asynccontextmanager
    async def lifespan(app):
        upgrade_schema(engine)
        yield
        engine.dispose()

    app = FastAPI(title='Cálculo adaptativo UPAO · demo', version='0.1.0', lifespan=lifespan)

    def db():
        with Session(engine) as session:
            yield session

    DB = Annotated[Session, Depends(db)]

    def learner(session: DB, authorization: Annotated[str | None, Header()] = None):
        token = authorization.removeprefix('Bearer ') if authorization else ''
        if not token or not session.get(Learner, token):
            raise HTTPException(401, 'La sesión de demostración no es válida.')
        return token

    User = Annotated[str, Depends(learner)]

    def owned(session, exercise_id, token):
        exercise = session.get(Exercise, exercise_id)
        if exercise is None or exercise.learner != token:
            raise HTTPException(404, 'Ejercicio no encontrado.')
        return exercise

    def history(session, token, topic=None):
        stmt = select(Attempt).join(Exercise).where(Exercise.learner == token)
        if topic:
            stmt = stmt.where(Exercise.topic == topic)
        return session.scalars(stmt.order_by(Attempt.submitted_at, Attempt.exercise_id)).all()

    def public(exercise):
        return {key: getattr(exercise, key) for key in ('id', 'topic', 'level', 'prompt', 'formula', 'version', 'hint_used')}

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'mode': 'local-demo'}

    @app.post('/api/sessions', status_code=201)
    def new_session(session: DB):
        token = secrets.token_hex(24)
        session.add(Learner(token=token))
        session.commit()
        return {'token': token}

    @app.get('/api/topics')
    def topics():
        return TOPICS

    @app.get('/api/progress')
    def progress(session: DB, token: User):
        attempts = history(session, token)
        return {'attempts': len(attempts), 'correct': sum(a.correct for a in attempts),
                'topics': [{'id': t['id'], 'level': level_for(history(session, token, t['id'])),
                            'attempts': len(history(session, token, t['id']))} for t in TOPICS]}

    @app.post('/api/exercises/{topic}')
    def next_exercise(topic: str, session: DB, token: User):
        if topic not in {t['id'] for t in TOPICS}:
            raise HTTPException(404, 'Tema no encontrado.')
        # Reanudar un ejercicio pendiente también al recargar; no revelar la solución.
        existing = session.scalar(select(Exercise).where(Exercise.learner == token, Exercise.topic == topic,
                                  ~Exercise.id.in_(select(Attempt.exercise_id))).order_by(Exercise.created_at))
        if existing:
            return public(existing)
        level = level_for(history(session, token, topic))
        prompt, formula, expected, hint, explanation = generate(topic, level)
        exercise = Exercise(id=secrets.token_hex(16), learner=token, topic=topic, level=level,
                            prompt=prompt, formula=formula, expected=expected, hint=hint, explanation=explanation, version=RESOURCE_VERSION)
        session.add(exercise)
        session.commit()
        return public(exercise)

    @app.post('/api/exercises/{exercise_id}/hint')
    def hint(exercise_id: str, session: DB, token: User):
        exercise = owned(session, exercise_id, token)
        if session.get(Attempt, exercise_id) is None:
            exercise.hint_used = True
            session.commit()
        return {'hint': exercise.hint}

    @app.post('/api/exercises/{exercise_id}/answer')
    def answer(exercise_id: str, body: AnswerInput, session: DB, token: User):
        exercise = owned(session, exercise_id, token)
        attempt = session.get(Attempt, exercise_id)
        if attempt is None:
            number = parse_number(body.answer)
            attempt = Attempt(exercise_id=exercise_id, answer=body.answer.strip(), correct=bool(number == Rational(exercise.expected)))
            session.add(attempt)
            try:
                session.commit()
            except IntegrityError:
                session.rollback()
                attempt = session.get(Attempt, exercise_id)
                if attempt is None:
                    raise
        return {'correct': attempt.correct, 'expected': exercise.expected, 'explanation': exercise.explanation,
                'answer': attempt.answer, 'level': level_for(history(session, token, exercise.topic))}

    @app.get('/api/export')
    def export(session: DB, token: User):
        buffer = io.StringIO(newline='')
        writer = csv.writer(buffer)
        writer.writerow(['exercise_id', 'topic', 'level', 'resource_version', 'answer', 'correct', 'hint_used', 'started_at_utc', 'submitted_at_utc'])
        for attempt in history(session, token):
            exercise = session.get(Exercise, attempt.exercise_id)
            # Canonical number prevents spreadsheet formula injection.
            writer.writerow([exercise.id, exercise.topic, exercise.level, exercise.version, str(parse_number(attempt.answer)),
                             int(attempt.correct), int(exercise.hint_used), exercise.created_at, attempt.submitted_at])
        return Response(buffer.getvalue(), media_type='text/csv; charset=utf-8',
                        headers={'Content-Disposition': 'attachment; filename="practica-demo.csv"'})

    app.include_router(build_exam_router(db, learner))
    return app


app = create_app()
