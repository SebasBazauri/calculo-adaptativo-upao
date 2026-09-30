# Mejoras posteriores vinculadas a la tesis

## Base del análisis

Se revisaron `docs/plan-de-trabajo.md`, `docs/01-protocolo-preliminar.md` y `docs/02-matriz-objetivos-instrumentos.md`. El informe original no está dentro del repositorio: se consultó el archivo aportado por el usuario, `D:/Informe Tesis I.md`, en particular sus objetivos específicos, diseño con preprueba/postprueba y grupo de control, instrumentos e hipótesis.

El informe busca evaluar el efecto de recursos adaptativos sobre el rendimiento en Cálculo I. Sus objetivos incluyen identificar dificultades (OE1), implementar la aplicación (OE2), diseñar recursos adaptativos (OE3), evaluar utilidad percibida (OE4) y evaluar efectividad académica (OE5). Las siguientes propuestas responden a esos objetivos; no implican resultados de mejora ya demostrados.

El generador recién implementado es una **autoevaluación de práctica**, con preguntas numéricas y dificultad elegida por el estudiante. Su historial no sustituye un instrumento académico validado ni demuestra causalidad. Las recomendaciones se guardan en `docs/`, ubicación ya usada por el proyecto para planificación e investigación.

## 1. Participantes, roles y grupos de estudio

- **Funcionalidad:** cuentas persistentes, roles estudiante/docente/investigador, códigos de participante y asignación a grupos autorizados.
- **Problema:** las sesiones demo dependen del navegador y no representan participantes verificables; no permiten seguimiento longitudinal fiable.
- **Relación con la tesis:** condición necesaria para ejecutar el diseño experimental/control y vincular mediciones del OE5.
- **Beneficio esperado:** continuidad de registros y permisos apropiados para cada actor, sin mezclar identidades.
- **Prioridad:** alta. **Complejidad:** alta.
- **Dependencias:** elección del mecanismo de autenticación, migración de identidad, protocolo de consentimiento y gestión de datos aprobado. No reutilizar tokens demo como identificadores de investigación.

## 2. Banco de recursos revisado y versionado

- **Funcionalidad:** fichas por plantilla con aprendizaje, prerrequisitos, nivel, explicación, revisión docente y bitácora de generación mediante vibe coding; publicación solo tras revisión.
- **Problema:** el banco actual es pequeño y demostrativo; sus niveles y cobertura no están validados ni alineados al sílabo confirmado.
- **Relación con la tesis:** OE2 y OE3; proporciona evidencia del diseño y refinamiento de recursos sin atribuir automáticamente eficacia a cada iteración.
- **Beneficio esperado:** contenido correcto, trazabilidad curricular e historial reproducible. Los snapshots de exámenes ya ofrecen una base para conservar versiones.
- **Prioridad:** alta. **Complejidad:** media.
- **Dependencias:** sílabo, docente revisor, roles, migraciones y formato de bitácora. Mantener separados ítems de práctica y de medición académica.

## 3. Diagnóstico de prerrequisitos y refuerzo por habilidad

- **Funcionalidad:** diagnóstico interno de álgebra y aprendizajes de la unidad, estado por habilidad y recomendaciones explícitas hacia teoría, laboratorio y práctica.
- **Problema:** la regla actual de aciertos consecutivos y el promedio por tema no identifican qué prerrequisito dificulta el avance.
- **Relación con la tesis:** OE1 y OE3; aborda las dificultades de bases matemáticas descritas en el planteamiento.
- **Beneficio esperado:** rutas de refuerzo más específicas y justificables que una dificultad global.
- **Prioridad:** alta. **Complejidad:** media.
- **Dependencias:** banco etiquetado, revisión pedagógica y criterios de dominio acordados. El diagnóstico interno no se utilizará como pretest de investigación por defecto.

## 4. Gestión de pretest/postest e indicadores académicos

- **Funcionalidad:** registro/importación de resultados de instrumentos supervisados, rúbricas y subpuntuaciones conceptual/procedimental; notas oficiales como resultado secundario.
- **Problema:** los exámenes autogenerados no garantizan equivalencia de formas ni condiciones de aplicación; solo puntúan respuestas numéricas finales.
- **Relación con la tesis:** OE5 e hipótesis de comprensión y resolución de problemas, respetando el protocolo preliminar que propone aplicación fuera de la app.
- **Beneficio esperado:** base de evaluación académica diferenciada del uso libre de recursos, con trazabilidad por ítem y momento.
- **Prioridad:** alta. **Complejidad:** alta.
- **Dependencias:** validación de instrumentos, rúbricas, participantes/grupos y decisiones de análisis con el asesor. No convertir las notas de autoevaluación en pre/post retrospectivamente.

## 5. Percepción de utilidad y seguimiento de participación

- **Funcionalidad:** encuesta Likert versionada del grupo experimental y panel docente de actividad, ausencias, exposición y dificultades por tema.
- **Problema:** las calificaciones no describen utilidad percibida y el tiempo transcurrido entre generación/envío incluye pausas.
- **Relación con la tesis:** OE4 para percepción y OE3/OE5 para contextualizar uso y fidelidad de intervención.
- **Beneficio esperado:** identificar problemas de uso y describir exposición sin confundir satisfacción con aprendizaje o tiempo de reloj con tiempo activo.
- **Prioridad:** media. **Complejidad:** media.
- **Dependencias:** instrumento revisado, permisos y política de registros. Cualquier medición de actividad efectiva necesita reglas explícitas de sesión/inactividad antes de campo.

## 6. Exportación reproducible para análisis de la tesis

- **Funcionalidad:** exportaciones separadas y documentadas de práctica, autoevaluación, medición académica y encuesta; diccionario de datos, faltantes y versiones.
- **Problema:** actualmente solo se exporta la práctica individual; el historial de autoevaluaciones es descriptivo y no constituye una base completa para la investigación.
- **Relación con la tesis:** OE4/OE5 y procedimiento de análisis del protocolo.
- **Beneficio esperado:** análisis auditable y reducción de errores manuales, manteniendo las limitaciones de grupos intactos y la diferencia entre indicadores.
- **Prioridad:** media, necesaria antes del campo. **Complejidad:** media.
- **Dependencias:** modelos de los instrumentos, autorización de acceso y plan de análisis predefinido. No seleccionar métodos ni concluir mejora únicamente a partir del gráfico de autoevaluaciones.

## Secuencia propuesta

Cerrar sílabo y permisos mientras se implementan identidad y revisión de recursos; después diagnóstico y gestión de instrumentos; finalmente encuesta, panel y exportación reproducible. Estas tareas concretan el plan aceptado y no reemplazan sus validaciones ni el piloto.
