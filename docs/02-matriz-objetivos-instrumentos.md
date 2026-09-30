# Matriz operativa de objetivos e instrumentos

Versión 0.1 · Preparada para revisión. Los indicadores y especificaciones siguientes son propuestas operativas; no son instrumentos ya validados. Se presenta cada objetivo como ficha para mantener visibles sus relaciones.

## OE1 · Analizar dificultades de aprendizaje

**Pregunta operativa:** ¿qué prerrequisitos y aprendizajes de la unidad presentan mayores dificultades?

**Indicadores:** dificultades descritas por el docente; frecuencia de errores por aprendizaje en pretest; desempeño inicial por dimensión cuando la rúbrica lo permita.

**Fuentes e instrumentos:** sílabo, guía de entrevista docente y prueba académica inicial. El diagnóstico de la app se conserva separado y solo complementa información del experimental.

**Momentos:** revisión curricular en semanas 1–2; pretest en semana 11.

**Evidencia:** ficha curricular, entrevista documentada, tabla de especificaciones y análisis inicial por código y grupo. Responsable: ambos investigadores; revisión curricular: docente.

**Criterio:** cada dificultad priorizada se vincula a un contenido y una evidencia; no generalizar a toda UPAO a partir de dos secciones.

## OE2 · Implementar la aplicación web

**Indicadores:** requisitos esenciales aceptados respecto del total previsto; ejecución completa del flujo de práctica; integridad de registros y permisos.

**Instrumentos:** lista de aceptación funcional, casos de prueba, registro de incidencias y acta de piloto.

**Momentos:** semanas 3–10.

**Evidencia:** versión de aplicación, pruebas de ingreso–ejercicio–retroalimentación–exportación, respaldo restaurado y manual. Responsable técnico: Sebastian; interfaz: Joseph; revisión cruzada: ambos.

**Criterio:** ningún fallo pendiente altera calificaciones, expone registros ajenos, pierde intentos o impide los flujos esenciales.

## OE3 · Diseñar recursos adaptativos

**Indicadores:** plantillas y simulaciones revisadas; cobertura curricular; cambios documentados; cumplimiento de reglas adaptativas ante perfiles de prueba.

**Instrumentos:** ficha de recurso, lista de revisión matemática/pedagógica, bitácora de vibe coding y casos de adaptación.

**Momentos:** semanas 3–10; seguimiento de versiones durante campo.

**Evidencia:** meta provisional de 36 plantillas y tres simulaciones, revisiones del docente y trazabilidad de cada cambio. Responsable: ambos investigadores con revisión docente.

**Criterio:** cada recurso publicado identifica objetivo, subtema, dificultad, solución, restricciones, pistas, versión y revisión. La cantidad de iteraciones describe desarrollo, no demuestra eficacia causal.

## OE4 · Evaluar percepción de utilidad

**Indicadores:** distribución de respuestas por ítem; respuestas válidas y ausencias; comentarios opcionales sobre utilidad y dificultades.

**Instrumento:** cuestionario Likert, cinco alternativas desde muy en desacuerdo hasta muy de acuerdo. Propuesta de nueve ítems en tres áreas: utilidad percibida, claridad y experiencia interactiva. La agrupación final requiere revisión.

**Momento:** semana 18, experimental únicamente.

**Evidencia:** versión del cuestionario, revisión de expertos, respuestas codificadas y análisis. Responsable: Joseph; revisión y análisis: ambos.

**Criterio:** no presentar percepción de mejora como mejora académica objetiva ni asumir un puntaje global válido sin justificarlo.

## OE5 · Evaluar resultados académicos

**Indicador principal:** puntaje del postest en los aprendizajes de la unidad, con referencia al pretest según el análisis acordado.

**Indicadores secundarios:** subpuntuaciones conceptual y procedimental, cuando proceda; notas oficiales comparables; cambios pre/post como descripción complementaria.

**Instrumentos:** formas A/B, rúbrica, ficha de notas oficiales y protocolo de análisis.

**Momentos:** pretest semana 11; postest semana 18; análisis semanas 19–20.

**Evidencia:** registros por ítem, puntajes, versiones, grupo y sección; base depurada con historial de transformaciones; análisis reproducible. Responsable: ambos con revisión del asesor.

**Criterio:** conclusiones acordes con el diseño real, con datos faltantes y diferencias de sección documentados.

## Especificación inicial de la prueba académica

Propuesta de trabajo: 12 ítems, seis de comprensión conceptual y seis de resolución de problemas, distribuidos entre los seis subtemas que confirme el docente. Proponer dos ítems por subtema, uno por dimensión, sin fijar todavía el peso final. Duración y puntuación se establecerán al revisar dificultad y tiempos en el piloto.

Cada ítem debe identificar código, forma, subtema, aprendizaje, dimensión, enunciado, respuesta, rúbrica, puntaje máximo y revisión. Las dos formas deben conservar la cobertura prevista. Esta especificación precede a la escritura de preguntas y depende del sílabo.

## Diccionario mínimo para trazabilidad

- `participant_code`: código seudonimizado, común a las fuentes; no incluye nombre ni DNI.
- `section_code`, `study_group`: sección y condición, sin confundirlas con nivel de dominio.
- `assessment_moment`, `instrument_version`, `item_code`: momento pre/post, versión e ítem.
- `raw_score`, `max_score`, `missing_reason`: puntaje bruto, máximo y motivo de ausencia; cero es una respuesta puntuada, no un valor faltante.
- `resource_code`, `resource_version`, `skill_code`: recurso, versión y habilidad de práctica.
- `attempt_code`, `started_at`, `submitted_at`, `correctness`, `hints_used`: intento, tiempos, resultado y pistas; definir zona horaria y reglas para sesiones inactivas al diseñar el sistema.
- `survey_item_code`, `response_value`: ítem y respuesta de percepción; separar omisión de alternativa válida.

Pretest/postest, práctica y encuesta permanecerán en conjuntos diferenciados enlazables por código. No almacenar una nota oficial en el campo del postest ni una respuesta de encuesta como calificación académica.

## Guía breve para el docente

1. ¿Qué unidad coincide con seis semanas consecutivas disponibles?
2. ¿Qué seis aprendizajes conviene priorizar y qué prerrequisitos necesitan?
3. ¿Qué errores observa y qué evidencia puede compartir sin identificar estudiantes?
4. ¿Cómo se evalúan comprensión y resolución de problemas en esa unidad?
5. ¿Qué condiciones de docencia y práctica comparten o diferencian las secciones?
6. ¿Qué espacios existen para las sesiones, pretest, postest y revisión de recursos?

Registrar respuestas, fecha y acuerdos cuando se realice la reunión; no completar con supuestos.
