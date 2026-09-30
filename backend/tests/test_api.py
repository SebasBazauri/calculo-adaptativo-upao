import pytest
from fastapi.testclient import TestClient
from app.main import create_app, level_for, Attempt


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(f'sqlite:///{tmp_path / "test.db"}')) as client:
        yield client


def session(client):
    return {'Authorization': 'Bearer ' + client.post('/api/sessions').json()['token']}


def test_private_exercises_and_no_answer_leak(client):
    one, two = session(client), session(client)
    exercise = client.post('/api/exercises/limits', headers=one).json()
    assert 'expected' not in exercise and 'explanation' not in exercise
    assert client.post('/api/exercises/limits', headers=one).json()['id'] == exercise['id']
    assert client.post(f'/api/exercises/{exercise["id"]}/answer', json={'answer': '1'}, headers=two).status_code == 404
    assert client.get('/api/progress').status_code == 401


def test_invalid_answers_and_idempotent_submission(client):
    headers = session(client)
    exercise = client.post('/api/exercises/limits', headers=headers).json()
    url = f'/api/exercises/{exercise["id"]}/answer'
    for value in ['1/0', 'nan', '__import__("os")', '2**9999', '=1+1']:
        assert client.post(url, json={'answer': value}, headers=headers).status_code == 422
    first = client.post(url, json={'answer': '0'}, headers=headers).json()
    second = client.post(url, json={'answer': '100'}, headers=headers).json()
    assert first == second
    assert client.get('/api/progress', headers=headers).json()['attempts'] == 1
    assert client.get('/api/export', headers=headers).text.count('\n') == 2


def test_numeric_equivalence_and_hint(client):
    import re
    headers = session(client)
    exercise = client.post('/api/exercises/limits', headers=headers).json()
    x, a, b = map(int, re.findall(r'\d+', exercise['formula']))
    expected = a*x+b
    assert client.post(f'/api/exercises/{exercise["id"]}/hint', headers=headers).status_code == 200
    result = client.post(f'/api/exercises/{exercise["id"]}/answer', json={'answer': f'{expected*2}/2'}, headers=headers).json()
    assert result['correct']
    assert client.get('/api/progress', headers=headers).json()['correct'] == 1


def test_adaptation_stays_bounded():
    assert level_for([]) == 1
    assert level_for([Attempt(correct=True) for _ in range(3)]) == 2
    assert level_for([Attempt(correct=True) for _ in range(20)]) == 3
    assert level_for([Attempt(correct=False) for _ in range(20)]) == 1


def test_records_persist_after_restart(tmp_path):
    url = f'sqlite:///{tmp_path / "persistent.db"}'
    with TestClient(create_app(url)) as first:
        headers = session(first)
        exercise = first.post('/api/exercises/limits', headers=headers).json()
        first.post(f'/api/exercises/{exercise["id"]}/answer', json={'answer': '0'}, headers=headers)
    with TestClient(create_app(url)) as second:
        assert second.get('/api/progress', headers=headers).json()['attempts'] == 1
        # A hint requested after submission must not change the recorded exposure.
        second.post(f'/api/exercises/{exercise["id"]}/hint', headers=headers)
        import csv, io
        rows = list(csv.DictReader(io.StringIO(second.get('/api/export', headers=headers).text)))
        assert rows[0]['hint_used'] == '0'


@pytest.mark.parametrize('level', [1, 2, 3])
def test_derivative_generators_match_power_rule(level):
    import re
    from app.main import generate, parse_number
    for _ in range(15):
        prompt, formula, expected, _, _ = generate('derivatives', level)
        point = int(re.search(r'x = (\d+)', prompt).group(1))
        coefficient = int(re.search(r'= (\d+)x', formula).group(1))
        assert parse_number(expected) == coefficient * (level + 1) * point**level
