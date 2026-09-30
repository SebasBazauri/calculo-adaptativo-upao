"""Modelos persistentes de práctica y autoevaluación."""
from datetime import datetime, timezone
from sqlalchemy import Boolean, ForeignKey, Integer, String, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

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


class Exam(Base):
    __tablename__ = 'exams'
    __table_args__ = (
        UniqueConstraint('learner', 'request_id', name='uq_exam_generation_request'),
        CheckConstraint('question_count BETWEEN 3 AND 20'),
        CheckConstraint('level BETWEEN 1 AND 3'),
    )
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    learner: Mapped[str] = mapped_column(ForeignKey('demo_learners.token'), index=True)
    request_id: Mapped[str] = mapped_column(String(36))
    course: Mapped[str] = mapped_column(String(80), default='Cálculo I')
    topic: Mapped[str] = mapped_column(String(30))
    level: Mapped[int] = mapped_column(Integer)
    question_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[str] = mapped_column(String(40), default=now)
    submitted_at: Mapped[str | None] = mapped_column(String(40))
    correct_count: Mapped[int | None] = mapped_column(Integer)
    answered_count: Mapped[int | None] = mapped_column(Integer)
    elapsed_seconds: Mapped[int | None] = mapped_column(Integer)


class ExamQuestion(Base):
    """Snapshot independiente de ejercicios de práctica y futuras versiones del generador."""
    __tablename__ = 'exam_questions'
    __table_args__ = (UniqueConstraint('exam_id', 'position', name='uq_exam_question_position'),)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    exam_id: Mapped[str] = mapped_column(ForeignKey('exams.id'), index=True)
    position: Mapped[int] = mapped_column(Integer)
    topic: Mapped[str] = mapped_column(String(30))
    level: Mapped[int] = mapped_column(Integer)
    prompt: Mapped[str] = mapped_column(String(500))
    formula: Mapped[str] = mapped_column(String(300))
    expected: Mapped[str] = mapped_column(String(100))
    explanation: Mapped[str] = mapped_column(String(500))
    resource_version: Mapped[str] = mapped_column(String(30))


class ExamResponse(Base):
    __tablename__ = 'exam_responses'
    question_id: Mapped[str] = mapped_column(ForeignKey('exam_questions.id'), primary_key=True)
    answer: Mapped[str] = mapped_column(String(80))
    correct: Mapped[bool] = mapped_column(Boolean)


class SchemaMigration(Base):
    __tablename__ = 'schema_migrations'
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    applied_at: Mapped[str] = mapped_column(String(40), default=now)


