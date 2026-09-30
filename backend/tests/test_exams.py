from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, inspect, select
from sqlalchemy.orm import Session

from app.main import create_app
from app.models import Learner, Exercise, Attempt, Exam, ExamQuestion, ExamResponse, SchemaMigration
from app.migrations import upgrade_schema


@pytest.fixture
def env(tmp_path):
    url = f'sqlite:///{tmp_path / "exams.db"}'
    engine = create_engine(url)
    with TestClient(create_app(url)) as client:
        headers = {'Authorization': 'Bearer ' + client.post('/api/sessions').json()['token']}
        yield client, headers, engine, url
    engine.dispose()


def create(client, headers, **overrides):
    body = {'request_id': str(uuid4()), 'topic': 'mixed', 'level': 1, 'question_count': 5, **overrides}
    response = client.post('/api/exams', headers=headers, json=body)
    assert response.status_code == 201, response.text
    return response.json()


def correct_answers(engine, exam_id):
    with Session(engine) as db:
        return [{'question_id': q.id, 'answer': q.expected} for q in db.scalars(select(ExamQuestion).where(ExamQuestion.exam_id == exam_id).order_by(ExamQuestion.position))]


@pytest.mark.parametrize('topic', ['limits', 'derivatives', 'mixed'])
@pytest.mark.parametrize('level', [1, 2, 3])
def test_generate_snapshot_and_no_solution_leaks(env, topic, level):
    client, headers, engine, _ = env
    exam = create(client, headers, topic=topic, level=level, question_count=20)
    assert exam['status'] == 'in_progress' and exam['score'] is None
    assert len(exam['questions']) == 20
    assert len({(q['prompt'], q['formula']) for q in exam['questions']}) == 20
    for q in exam['questions']:
        assert not ({'expected', 'answer', 'correct', 'explanation', 'hint'} & q.keys())
        # Exam questions cannot be solved via the ordinary practice routes.
        assert client.post(f'/api/exercises/{q["id"]}/answer', headers=headers, json={'answer': '1'}).status_code == 404
    retrieved = client.get(f'/api/exams/{exam["id"]}', headers=headers).json()
    assert retrieved == exam
    with Session(engine) as db:
        assert db.scalar(select(func.count()).select_from(Exercise)) == 0


@pytest.mark.parametrize('override', [
    {'topic': 'integrals'}, {'level': 0}, {'level': 4}, {'level': True}, {'level': 1.5},
    {'question_count': 2}, {'question_count': 21}, {'question_count': '5'},
    {'request_id': 'bad'}, {'score': 20}, {'course': 'Otro curso'},
])
def test_generation_validation(env, override):
    client, headers, _, _ = env
    body = {'request_id': str(uuid4()), 'topic': 'limits', 'level': 1, 'question_count': 5, **override}
    assert client.post('/api/exams', headers=headers, json=body).status_code == 422
    assert client.get('/api/exams', headers=headers).json()['total'] == 0


def test_generation_retry_and_conflicting_parameters(env):
    client, headers, _, _ = env
    request_id = str(uuid4())
    one = create(client, headers, request_id=request_id)
    assert create(client, headers, request_id=request_id)['id'] == one['id']
    response = client.post('/api/exams', headers=headers, json={'request_id': request_id, 'topic': 'limits', 'level': 2, 'question_count': 5})
    assert response.status_code == 409
    assert client.get('/api/exams', headers=headers).json()['total'] == 1


def test_submit_server_score_idempotence_and_history(env):
    client, headers, engine, _ = env
    exam = create(client, headers)
    answers = correct_answers(engine, exam['id'])
    answers[0]['answer'] = f'{int(answers[0]["answer"])*2}/2'
    answers[1]['answer'] = '-1'
    answers.pop()  # One unanswered question is counted separately and also as incorrect.
    url = f'/api/exams/{exam["id"]}/submit'
    result = client.post(url, headers=headers, json={'answers': answers}).json()
    assert result['status'] == 'completed'
    assert result['correct_count'] == 3 and result['incorrect_count'] == 2
    assert result['unanswered_count'] == 1 and result['answered_count'] == 4
    assert result['score'] == 12 and result['percentage'] == 60
    assert result['elapsed_seconds'] >= 0 and result['submitted_at']
    assert len(result['questions']) == 5 and all('expected' in q for q in result['questions'])
    assert client.post(url, headers=headers, json={'answers': answers}).json() == result
    answers[0]['answer'] = '0'
    assert client.post(url, headers=headers, json={'answers': answers}).status_code == 409
    listed = client.get('/api/exams', headers=headers).json()['items'][0]
    assert listed['score'] == 12 and 'questions' not in listed
    assert client.get('/api/progress', headers=headers).json()['attempts'] == 0
    with Session(engine) as db:
        assert db.scalar(select(func.count()).select_from(ExamResponse)) == 5


def test_invalid_submission_is_atomic_and_checks_question_ownership(env):
    client, headers, engine, _ = env
    exam, other = create(client, headers), create(client, headers)
    answers = correct_answers(engine, exam['id'])
    url = f'/api/exams/{exam["id"]}/submit'
    invalid_cases = [
        {'answers': answers + [answers[0]]},
        {'answers': [{'question_id': other['questions'][0]['id'], 'answer': '1'}]},
        {'answers': [*answers[:-1], {'question_id': answers[-1]['question_id'], 'answer': '1/0'}]},
        {'answers': [{'question_id': answers[0]['question_id'], 'answer': '__import__("os")'}]},
        {'answers': answers, 'score': 20},
        {'answers': [{'question_id': answers[0]['question_id'], 'answer': '1', 'correct': True}]},
    ]
    for body in invalid_cases:
        assert client.post(url, headers=headers, json=body).status_code == 422
        assert client.get(f'/api/exams/{exam["id"]}', headers=headers).json()['status'] == 'in_progress'
        with Session(engine) as db:
            assert db.scalar(select(func.count()).select_from(ExamResponse)) == 0
    assert client.post(url, headers=headers, json={'answers': answers}).json()['score'] == 20


def test_authorization_and_not_found(env):
    client, headers, _, _ = env
    exam = create(client, headers)
    other = {'Authorization': 'Bearer ' + client.post('/api/sessions').json()['token']}
    for path in ['/api/exams', '/api/exams/metrics', f'/api/exams/{exam["id"]}']:
        assert client.get(path).status_code == 401
    assert client.post('/api/exams', json={'request_id': str(uuid4()), 'topic': 'limits', 'level': 1, 'question_count': 3}).status_code == 401
    assert client.post(f'/api/exams/{exam["id"]}/submit', json={'answers': []}).status_code == 401
    assert client.get(f'/api/exams/{exam["id"]}', headers=other).status_code == 404
    assert client.post(f'/api/exams/{exam["id"]}/submit', headers=other, json={'answers': []}).status_code == 404
    assert client.get('/api/exams/nonexistent', headers=headers).status_code == 404
    assert client.get('/api/exams', headers=other).json()['items'] == []
    assert client.get('/api/exams/metrics', headers=other).json()['completed_exams'] == 0


def test_metrics_denominators_and_pending_exclusion(env):
    client, headers, engine, _ = env
    empty = client.get('/api/exams/metrics', headers=headers).json()
    assert empty['average_score'] is None and empty['timeline'] == []
    first = create(client, headers, topic='limits', question_count=3)
    client.post(f'/api/exams/{first["id"]}/submit', headers=headers, json={'answers': correct_answers(engine, first['id'])})
    second = create(client, headers, topic='derivatives', question_count=5)
    client.post(f'/api/exams/{second["id"]}/submit', headers=headers, json={'answers': []})
    create(client, headers, question_count=20)  # Pending must not enter averages.
    stats = client.get('/api/exams/metrics', headers=headers).json()
    assert stats['completed_exams'] == 2 and stats['average_score'] == 10
    assert stats['average_percentage'] == 50 and stats['overall_percentage'] == 37.5
    assert stats['answered'] == 3 and stats['questions'] == 8 and stats['unanswered'] == 5
    assert len(stats['timeline']) == 2
    assert {t['topic']: t['percentage'] for t in stats['by_topic']} == {'limits': 100, 'derivatives': 0}
    assert 'derivadas' in stats['suggestion']
    assert client.get('/api/exams?offset=1&limit=1', headers=headers).json()['total'] == 3
    assert len(client.get('/api/exams?offset=1&limit=1', headers=headers).json()['items']) == 1
    assert client.get('/api/exams?limit=100', headers=headers).status_code == 422


def test_snapshot_and_history_survive_restart_and_generator_change(env, monkeypatch):
    client, headers, engine, url = env
    exam = create(client, headers)
    answers = correct_answers(engine, exam['id'])
    monkeypatch.setattr('app.exams.generate', lambda *args: (_ for _ in ()).throw(AssertionError('Do not regenerate historic questions')))
    result = client.post(f'/api/exams/{exam["id"]}/submit', headers=headers, json={'answers': answers}).json()
    with TestClient(create_app(url)) as restarted:
        assert restarted.get(f'/api/exams/{exam["id"]}', headers=headers).json() == result
        assert restarted.get('/api/exams/metrics', headers=headers).json()['completed_exams'] == 1


def test_concurrent_submission_single_result(env):
    client, headers, engine, _ = env
    exam = create(client, headers)
    payload = {'answers': correct_answers(engine, exam['id'])}
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda _: client.post(f'/api/exams/{exam["id"]}/submit', headers=headers, json=payload), range(2)))
    assert [r.status_code for r in responses] == [200, 200]
    assert responses[0].json() == responses[1].json()
    with Session(engine) as db:
        assert db.scalar(select(func.count()).select_from(ExamResponse)) == 5


def test_migration_preserves_legacy_records_and_is_repeatable(tmp_path):
    engine = create_engine(f'sqlite:///{tmp_path / "legacy.db"}')
    for model in [Learner, Exercise, Attempt]:
        model.__table__.create(engine)
    with Session(engine) as db:
        db.add(Learner(token='legacy'))
        db.flush()
        db.add(Exercise(id='exercise-old', learner='legacy', topic='limits', level=1, prompt='Antiguo', formula='2x', expected='4', hint='Pista', explanation='Explicación', version='demo-1'))
        db.flush()
        db.add(Attempt(exercise_id='exercise-old', answer='4', correct=True))
        db.commit()
    upgrade_schema(engine)
    upgrade_schema(engine)
    assert {'exams', 'exam_questions', 'exam_responses', 'schema_migrations'} <= set(inspect(engine).get_table_names())
    with Session(engine) as db:
        assert db.get(Exercise, 'exercise-old').version == 'demo-1'
        assert db.get(Attempt, 'exercise-old').correct
        assert list(db.scalars(select(SchemaMigration.version).order_by(SchemaMigration.version))) == [1, 2]
    engine.dispose()
