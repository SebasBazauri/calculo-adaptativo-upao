"""Prueba manual HTTP: python tests/smoke_local.py http://127.0.0.1:5174.

Crea una sesión demo nueva y tres intentos; no modifica otras sesiones.
"""
import json
import re
import sys
from urllib.request import Request, urlopen

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5173'
token = None


def request(path, method='GET', body=None):
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'
    with urlopen(Request(base + '/api' + path, data=data, headers=headers, method=method), timeout=10) as response:
        return json.loads(response.read())


assert request('/health')['status'] == 'ok'
token = request('/sessions', 'POST')['token']
assert len(request('/topics')) == 2
for _ in range(3):
    exercise = request('/exercises/limits', 'POST')
    x, a, b = map(int, re.findall(r'\d+', exercise['formula']))
    assert request(f'/exercises/{exercise["id"]}/hint', 'POST')['hint']
    result = request(f'/exercises/{exercise["id"]}/answer', 'POST', {'answer': str(a*x+b)})
    assert result['correct']
progress = request('/progress')
assert progress['attempts'] == 3 and progress['correct'] == 3
assert request('/exercises/limits', 'POST')['level'] == 2
print('HTTP OK: sesión, temas, pistas, 3 respuestas correctas, persistencia y avance a nivel 2.')
