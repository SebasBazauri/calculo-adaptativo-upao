"""Generación y corrección numérica compartidas por práctica y exámenes."""
import random
import re
from fastapi import HTTPException
from sympy import Rational

RESOURCE_VERSION = "demo-2"

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
        return ('Resuelve la indeterminación antes de calcular el límite.', f'lim x → {x}   [{a}(x² − {x*x}) / (x − {x}) + {b}]', str(2*a*x+b),
                f'Factoriza x² − {x*x} como (x − {x})(x + {x}).',
                f'Para x ≠ {x}, la expresión es {a}(x + {x}) + {b}. Su límite es {2*a*x+b}.')
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


