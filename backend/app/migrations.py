"""Migraciones aditivas para el prototipo; nunca eliminan ni reescriben datos.

001 reconoce el esquema de práctica legado; 002 añade exámenes.
Los futuros cambios de columnas necesitan una migración explícita, no create_all.
Ejecutar un solo proceso de arranque/migración a la vez.
"""
from sqlalchemy import select
from .models import Learner, Exercise, Attempt, Exam, ExamQuestion, ExamResponse, SchemaMigration


def upgrade_schema(engine):
    migrations = [(1, [Learner, Exercise, Attempt]), (2, [Exam, ExamQuestion, ExamResponse])]
    with engine.begin() as connection:
        SchemaMigration.__table__.create(connection, checkfirst=True)
        applied = set(connection.execute(select(SchemaMigration.version)).scalars())
        if applied - {version for version, _ in migrations}:
            raise RuntimeError('La base tiene una versión de esquema más reciente que esta aplicación.')
        for version, models in migrations:
            if version in applied:
                continue
            for model in models:
                model.__table__.create(connection, checkfirst=True)
            connection.execute(SchemaMigration.__table__.insert().values(version=version))
