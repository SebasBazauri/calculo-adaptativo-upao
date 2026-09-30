export type TopicId = 'limits' | 'derivatives';
export type Lesson = {
  id: string; topic: TopicId; title: string; subtitle: string; objective: string;
  sections: { title: string; text: string; formula?: string }[];
  example: { title: string; steps: string[]; result: string };
  warning: string; question: string;
};

export const topicNames: Record<TopicId, string> = { limits: 'Límites', derivatives: 'Derivadas' };

// Contenido editorial demo v1; pendiente de contraste con el sílabo y revisión docente.
export const lessons: Lesson[] = [
  {
    id: 'limit-value', topic: 'limits', title: 'La idea de límite', subtitle: 'Acercarse a un punto sin tener que alcanzarlo',
    objective: 'Interpretar el límite como el valor al que se aproxima una función.',
    sections: [
      { title: '¿Qué significa aproximarse?', text: 'Al tomar valores de x cada vez más cercanos a a, observamos los valores de f(x). Si se acercan a un mismo número L desde ambos lados, escribimos que el límite es L.', formula: 'lim x → a f(x) = L' },
      { title: 'Sustitución en funciones continuas', text: 'En un polinomio puedes sustituir directamente el valor de a. Esto funciona porque los polinomios son continuos en todos los números reales.', formula: 'Si f es continua en a: lim x → a f(x) = f(a)' },
    ],
    example: { title: 'Límite de f(x) = 2x + 1 cuando x → 2', steps: ['Identifica que 2x + 1 es un polinomio.', 'Sustituye x por 2: 2(2) + 1.', 'Opera: 4 + 1 = 5. Por ambos lados, la función se aproxima a 5.'], result: 'lim x → 2 (2x + 1) = 5' },
    warning: 'El límite describe lo que ocurre cerca del punto. No siempre coincide con el valor de la función en ese punto.', question: '¿A qué valor se aproxima f(x) = 2x + 1 cuando x se acerca a 3?',
  },
  {
    id: 'limit-hole', topic: 'limits', title: 'Indeterminación y factorización', subtitle: 'Resolver una forma 0/0',
    objective: 'Simplificar una expresión para estudiar su comportamiento cerca de un punto excluido.',
    sections: [
      { title: 'La forma 0/0', text: 'Si al sustituir obtienes 0/0, todavía no has calculado el límite. Necesitas transformar la expresión o usar otro procedimiento.' },
      { title: 'Cancelar un factor con una condición', text: 'Una diferencia de cuadrados permite cancelar un factor cuando este es distinto de cero. La expresión simplificada coincide con la original cerca del punto, aunque no necesariamente en él.', formula: 'x² − a² = (x − a)(x + a)' },
    ],
    example: { title: 'Límite de (x² − 4)/(x − 2) cuando x → 2', steps: ['La sustitución produce 0/0.', 'Factoriza el numerador: (x − 2)(x + 2).', 'Para x ≠ 2, cancela x − 2 y obtén x + 2.', 'Calcula el límite de x + 2 cuando x → 2: 4.'], result: 'El límite es 4, aunque la función original no está definida en x = 2.' },
    warning: 'Cancelar el factor no llena el hueco de la función original. La igualdad simplificada solo vale para x ≠ 2.', question: '¿Qué cambia si defines por separado el valor de la función en x = 2?',
  },
  {
    id: 'limit-sides', topic: 'limits', title: 'Límites laterales y continuidad', subtitle: 'Comparar lo que ocurre a la izquierda y a la derecha',
    objective: 'Reconocer cuándo existe un límite bilateral y cuándo una función es continua.',
    sections: [
      { title: 'Dos aproximaciones', text: 'El límite por la izquierda usa valores menores que a; el de la derecha usa valores mayores. Un límite bilateral finito existe cuando ambos límites laterales existen y coinciden.', formula: 'lim x → a⁻ f(x) = lim x → a⁺ f(x) = L' },
      { title: 'Tres condiciones de continuidad', text: 'Para ser continua en a, la función debe estar definida en a, tener límite en a y cumplir que ese límite sea igual a f(a).' },
    ],
    example: { title: 'f(x) = 1 si x < 0; f(x) = 3 si x ≥ 0', steps: ['Desde la izquierda de 0, f(x) siempre vale 1.', 'Desde la derecha de 0, f(x) siempre vale 3.', 'Los límites laterales son diferentes; el límite bilateral no existe.', 'Aunque f(0) = 3 está definido, la función no es continua en 0.'], result: 'No existe lim x → 0 f(x).' },
    warning: 'Que f(a) exista no garantiza que exista el límite ni que la función sea continua.', question: '¿Qué tendría que cambiar en esta función para hacerla continua en 0?',
  },
  {
    id: 'derivative-secant', topic: 'derivatives', title: 'De la secante a la tangente', subtitle: 'La derivada como límite de una razón de cambio',
    objective: 'Relacionar la pendiente media entre dos puntos con la pendiente instantánea.',
    sections: [
      { title: 'Razón de cambio media', text: 'La pendiente de la secante entre x = a y x = a + h compara el cambio de la función con el cambio de x. Aquí h debe ser distinto de cero.', formula: 'm = [f(a + h) − f(a)] / h' },
      { title: 'Derivada en un punto', text: 'Cuando h se acerca a cero, el límite de esas pendientes, si existe y es finito, define la derivada en a.', formula: 'f′(a) = lim h → 0 [f(a + h) − f(a)] / h' },
    ],
    example: { title: 'Pendiente de f(x) = x² en a = 1', steps: ['Calcula f(1 + h) − f(1): (1 + h)² − 1 = 2h + h².', 'Divide entre h ≠ 0: 2 + h.', 'Cuando h → 0, 2 + h → 2.'], result: 'f′(1) = 2' },
    warning: 'No sustituyas h = 0 en el cociente inicial. Estudia el límite para h distinto de cero.', question: 'Compara las pendientes para h = 1, h = 0.1 y h = −0.1.',
  },
  {
    id: 'derivative-power', topic: 'derivatives', title: 'Reglas básicas de derivación', subtitle: 'Potencias, constantes y sumas',
    objective: 'Derivar polinomios y evaluar su derivada en un punto.',
    sections: [
      { title: 'Potencias y constantes', text: 'Para una potencia de exponente entero positivo, multiplica por el exponente y réstale uno. La derivada de una constante es cero.', formula: 'd/dx (axⁿ) = an xⁿ⁻¹; d/dx (c) = 0' },
      { title: 'Derivar antes de evaluar', text: 'Deriva cada término y luego sustituye el punto solicitado. El valor de la derivada representa una pendiente, no la altura de la curva.' },
    ],
    example: { title: 'f(x) = 3x³ + 2; calcula f′(2)', steps: ['Deriva 3x³: 3 · 3x² = 9x².', 'La derivada de 2 es 0, así que f′(x) = 9x².', 'Evalúa en x = 2: 9 · 2² = 36.'], result: 'f′(2) = 36' },
    warning: 'f(2) y f′(2) son cantidades diferentes: en este ejemplo, f(2) = 26 y f′(2) = 36.', question: '¿Cuál es la derivada de 4x² + 7? ¿Cuánto vale en x = 1?',
  },
  {
    id: 'derivative-tangent', topic: 'derivatives', title: 'La ecuación de la tangente', subtitle: 'Usar un punto y la pendiente instantánea',
    objective: 'Construir una recta tangente a partir del valor de la función y su derivada.',
    sections: [
      { title: 'Punto y pendiente', text: 'Si f es derivable en a, la tangente pasa por (a, f(a)) y tiene pendiente f′(a).', formula: 'y = f(a) + f′(a)(x − a)' },
      { title: 'Interpretación local', text: 'La tangente ofrece una aproximación lineal cerca del punto de contacto. No reemplaza a la función en todo su dominio.' },
    ],
    example: { title: 'Tangente a f(x) = x² en a = 1', steps: ['El punto de contacto es (1, 1).', 'La pendiente es f′(1) = 2.', 'Sustituye en la fórmula: y = 1 + 2(x − 1).', 'Simplifica: y = 2x − 1.'], result: 'Recta tangente: y = 2x − 1' },
    warning: 'Una tangente no tiene por qué tocar la curva una sola vez ni quedarse siempre del mismo lado de ella.', question: '¿Qué ecuación tiene la tangente a x² en a = 0?',
  },
];
