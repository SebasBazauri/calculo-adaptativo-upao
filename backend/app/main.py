"""API de demostración local. No habilitada para investigación con datos reales."""
import csv
import io
import os
import random
import re
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import Boolean, ForeignKey, Integer, String, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from sympy import Rational


def now():
    return datetime.now(timezone.utc).isoformat()


class Base(DeclarativeBase):
    pass


class Learner(Base):
    __tablename__ = 'demo_learners'
    token: Mapped[str] = mapped_column(String(64), primary_key=True)


class Exercise(Base):
    __tablename__ = 'exercises'
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    learner: Mapped[str] = mapped_column(ForeignKey('demo_learners.token'))
    topic: Mapped[str] = mapped_column(String(30))
    level: Mapped[int] = mapped_column(Integer)
    prompt: Mapped[str] = mapped_column(String(500))
    formula: Mapped[str] = mapped_column(String(300))
    expected: Mapped[str] = mapped_column(String(100))
    hint: Mapped[str] = mapped_column(String(500))
    explanation: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[str] = mapped_column(String(40), default=now)
    hint_used: Mapped[bool] = mapped_column(Boolean, default=False)
    version: Mapped[str] = mapped_column(String(30), default='demo-1')


class Attempt(Base):
    __tablename__ = 'attempts'
    exercise_id: Mapped[str] = mapped_column(ForeignKey('exercises.id'), primary_key=True)
    answer: Mapped[str] = mapped_column(String(80))
    correct: Mapped[bool] = mapped_column(Boolean)
    submitted_at: Mapped[str] = mapped_column(String(40), default=now)


TOPICS = [
    {'id': 'limits', 'title': 'Límites', 'subtitle': 'Entiende a dónde se acerca una función.', 'unit': '01'},
    {'id': 'derivatives', 'title': 'Derivadas', 'subtitle': 'Explora cómo cambia una función.', 'unit': '02'},
]


def level_for(attempts):
    """Regla demo: tres aciertos consecutivos suben un nivel; un fallo reinicia la racha."""
    level, streak = 1, 0
    for attempt in attempts:
        streak = streak + 1 if attempt.correct else 0
        if streak == 3:
            level = min(3, level + 1)
            streak = 0
        if not attempt.correct:
            level = max(1, level - 1)
    return level


def generate(topic, level):
    a, b, x = random.randint(1, 5), random.randint(1, 6), random.randint(1, 4)
    if topic == 'limits':
        if level == 1:
            return ('Calcula el límite por sustitución directa.', f'lim x → {x}   ({a}x + {b})', str(a*x+b),
                    f'Sustituye x por {x} en {a}x + {b}.', f'{a} × {x} + {b} = {a*x+b}. La función es continua.')
        if level == 2:
            return ('Calcula el límite de esta función cuadrática.', f'lim x → {x}   ({a}x² + {b})', str(a*x*x+b),
                    'Un polinomio es continuo. Sustituye primero y respeta el orden de las operaciones.', f'{a} × {x}² + {b} = {a*x*x+b}.')
        return ('Resuelve la indeterminación antes de calcular el límite.', f'lim x → {x}   (x² − {x*x}) / (x − {x})', str(2*x),
                f'Factoriza x² − {x*x} como (x − {x})(x + {x}).', f'Para x ≠ {x}, el cociente es x + {x}. Su límite es {2*x}.')
    power = level + 1
    result = a*power*x**(power-1)
    return (f'Encuentra el valor de la derivada en x = {x}.', f'f(x) = {a}x{ {2:"²",3:"³",4:"⁴"}[power]} + {b}', str(result),
            f'Usa la regla de la potencia: la derivada de axⁿ es a·n·xⁿ⁻¹. La constante desaparece.',
            f'f′({x}) = {a} × {power} × {x}^{power-1} = {result}.')


def parse_number(value):
    value = value.strip().replace(',', '.')
    if not re.fullmatch(r'[+-]?\d{1,12}(?:\.\d{1,10})?(?:/[+-]?\d{1,12})?', value):
        raise HTTPException(422, 'Escribe un número, un decimal o una fracción como 3/2.')
    try:
        pieces = value.split('/')
        number = Rational(pieces[0])
        if len(pieces) == 2:
            if int(pieces[1]) == 0:
                raise ValueError()
            number /= int(pieces[1])
        return number
    except (ValueError, TypeError, ZeroDivisionError):
        raise HTTPException(422, 'La fracción debe tener un denominador distinto de cero.')


class AnswerInput(BaseModel):
    answer: str = Field(min_length=1, max_length=80)


def create_app(database_url=None):
    url = database_url or os.getenv('DATABASE_URL', 'sqlite:///./calculo.db')
    engine = create_engine(url, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {})

    @asynccontextmanager
    async def lifespan(app):
        Base.metadata.create_all(engine)
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
                            prompt=prompt, formula=formula, expected=expected, hint=hint, explanation=explanation)
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

    return app


app = create_app()
