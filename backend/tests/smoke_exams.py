"""Recorrido HTTP de autoevaluación. Ejecutar solo contra una demo local.

python tests/smoke_exams.py http://127.0.0.1:5174
Crea una sesión y un examen propios; no consulta ni altera sesiones existentes.
"""
import json
import re
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from uuid import uuid4

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5173'
token = None


def request(path, method='GET', body=None):
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    data = None
    if body is not None:
        headers['Content-Type'] = 'application/json'
        data = json.dumps(body).encode()
    with urlopen(Request(base + '/api' + path, method=method, data=data, headers=headers), timeout=15) as response:
        return json.loads(response.read())


token = request('/sessions', 'POST')['token']
exam = request('/exams', 'POST', {'request_id': str(uuid4()), 'topic': 'mixed', 'level': 1, 'question_count': 5})
assert exam['status'] == 'in_progress'
answers = []
for question in exam['questions']:
    assert 'expected' not in question
    if question['topic'] == 'limits':
        x, coefficient, constant = map(int, re.findall(r'\d+', question['formula']))
        expected = coefficient*x + constant
    else:
        x = int(re.search(r'x = (\d+)', question['prompt']).group(1))
        coefficient = int(re.search(r'= (\d+)x', question['formula']).group(1))
        expected = coefficient*2*x
    answers.append({'question_id': question['id'], 'answer': str(expected)})
url = f'/exams/{exam["id"]}/submit'
result = request(url, 'POST', {'answers': answers})
assert result['score'] == 20 and result['correct_count'] == 5
assert request(url, 'POST', {'answers': answers}) == result
assert request(f'/exams/{exam["id"]}') == result
assert request('/exams')['items'][0]['status'] == 'completed'
metrics = request('/exams/metrics')
assert metrics['completed_exams'] == 1 and metrics['average_score'] == 20
assert metrics['questions'] == 5 and len(metrics['by_topic']) == 2
assert request('/progress')['attempts'] == 0
token = request('/sessions', 'POST')['token']
try:
    request(f'/exams/{exam["id"]}')
    raise AssertionError('Otra sesión accedió al examen')
except HTTPError as error:
    assert error.code == 404
print('HTTP OK: generar, resolver, corregir, guardar, consultar historial/métricas y bloquear otra sesión.')
