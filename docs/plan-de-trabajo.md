# Plan de trabajo de tesis

**Proyecto:** Mejora de rendimiento académico de Cálculo I en estudiantes de ingeniería UPAO mediante el uso de recursos académicos generados con vibecoding.

**Autores:** Angel Sebastian Bazauri Villanueva y Joseph Kevin Salinas Rojas.  
**Asesor:** Walter Manuel Cueva Chavez.  
**Versión:** propuesta de planificación del 29 de septiembre de 2026.  
**Duración base:** 22 semanas relativas, sujeta al calendario de Cálculo I y a la disponibilidad de las secciones.

## 1. Resultado que debe entregar el proyecto

Desarrollar y validar una aplicación web con recursos adaptativos de Cálculo I y ejecutar un estudio que permita evaluar su efecto sobre el rendimiento académico, además de describir la percepción de utilidad de los estudiantes.

El cierre exige tres productos: una aplicación funcional con recursos revisados por un docente; datos e instrumentos que permitan evaluar la intervención; y un informe de tesis con resultados, limitaciones y conclusiones sustentadas. Una mejora estadísticamente significativa no es un requisito de éxito del proyecto: los resultados deben reportarse tal como se observen.

Este plan se basa en el informe y los dos textos adjuntos. Sus recomendaciones se tratan como propuestas, no como acuerdos ya aprobados. No se modifica el informe original.

## 2. Supuestos de planificación y decisiones pendientes

- **Participantes:** se utiliza como escenario de trabajo una muestra total de 60 estudiantes, aproximadamente 30 por grupo. Confirmar las matrículas reales y corregir la ambigüedad «dos secciones de 60 estudiantes».
- **Selección y asignación:** documentar por separado cómo se seleccionan las secciones y cómo se asigna la intervención. Tener grupos intactos no determina, por sí solo, que el muestreo sea no probabilístico. Si se eligen por acceso o disponibilidad, describirlo expresamente; cualquier sorteo entre secciones debe acordarse y documentarse con el asesor.
- **Contenido:** propuesta inicial de límites y derivadas, con refuerzo de prerrequisitos. Confirmar su correspondencia con una unidad del sílabo y con las seis semanas de intervención antes de construir el banco.
- **Trabajo de campo:** ocho semanas: una para pretest e incorporación, seis de uso y una para postest y encuesta.
- **Comparación:** procurar condiciones comparables de contenidos, calendario, evaluación y docencia. Registrar diferencias de docente, horario, asistencia y práctica adicional.
- **Medición:** pretest y postest presenciales y supervisados para ambos grupos; diagnóstico adaptativo separado dentro de la aplicación.
- **Disponibilidad:** estimación de 12–15 horas semanales por investigador, pendiente de acuerdo. Si no es viable, ajustar alcance o plazo antes de comprometer fechas.
- **Madurez tecnológica:** tratar TRL 6 como meta propuesta a justificar con evidencia y con la escala institucional aplicable, no como un nivel ya alcanzado.

La semana 1 comienza cuando el equipo acuerde el inicio. La semana 12 debe coincidir con el comienzo de la unidad curricular elegida. Si no coincide, desplazar el cronograma; no reducir las seis semanas de uso para recuperar retrasos de desarrollo.

## 3. Alcance de la primera versión

### Funcionalidades indispensables

1. Acceso con roles de estudiante y docente/investigador; separación de permisos y grupos.
2. Catálogo de temas, subtemas y prerrequisitos.
3. Diagnóstico interno que inicialice el nivel de dominio por subtema.
4. Banco de ejercicios paramétricos, con solución, restricciones matemáticas, pistas y revisión docente.
5. Selección adaptativa del siguiente ejercicio o recurso según el desempeño registrado.
6. Simulaciones interactivas vinculadas a actividades y preguntas de comprensión.
7. Registro de intentos, respuestas, resultados, tiempos, pistas y versiones de los recursos.
8. Panel de seguimiento, encuesta Likert y exportación de datos para la investigación.
9. Respaldo, recuperación y funcionamiento de la práctica con pistas predefinidas aunque no haya servicio de IA generativa.

**Meta inicial propuesta del banco:** seis subtemas, tres niveles y dos plantillas por combinación: 36 plantillas revisadas. Las variantes numéricas no cuentan como plantillas diferentes. Ajustar esta meta al sílabo durante la semana 2.

**Meta inicial de simulaciones:** tres, sobre aproximación a un límite, secante/tangente y aplicación de derivadas. Cada una debe incluir un propósito pedagógico, instrucciones y preguntas. Integrales y sumas de Riemann quedan fuera de esta primera versión salvo que el sílabo elegido las requiera.

Las pistas generativas en tiempo real son opcionales. El chatbot abierto, la aplicación móvil nativa, las integraciones institucionales y la cobertura de todo Cálculo I no son requisitos de esta versión.

### Base técnica tomada del contexto

Mantener como propuesta React y TypeScript para la interfaz; FastAPI y Python para la API; PostgreSQL para datos; SymPy como apoyo a la verificación matemática; KaTeX para fórmulas y una biblioteca de gráficas para simulaciones. Netlify y Railway son las opciones de alojamiento mencionadas en el contexto, sujetas a revisión técnica y presupuestal antes de contratar.

La arquitectura se resolverá como una aplicación con módulos bien separados, sin introducir microservicios. Las versiones, cuotas y tarifas deberán verificarse al implementar; este plan no constituye una validación de precios ni de compatibilidad actual.

## 4. Cronograma por fases

### Fase 1. Cierre metodológico y coordinación — semanas 1–2

**Actividades:** revisar el sílabo; identificar dificultades con el docente y antecedentes disponibles; confirmar acceso a secciones y calendario; precisar muestra, selección y asignación; corregir variables, objetivos, hipótesis y matriz de consistencia; definir instrumentos, permisos y consentimiento.

Definir el puntaje académico principal y el papel secundario de las notas oficiales. Separar comprensión conceptual y resolución de problemas en la tabla de especificaciones si se mantienen las hipótesis correspondientes. Revisar Hi(3): contar iteraciones no demuestra que estas causen una mejora; proponer reformularla como objetivo de desarrollo o diseñar una evaluación específica con el asesor.

**Entregables:** protocolo de estudio actualizado, alcance curricular, lista priorizada de requisitos, matriz objetivo–indicador–instrumento y calendario de campo tentativo.

**Criterio de cierre:** asesor y docente revisan el alcance y el protocolo; quedan identificados responsables y fechas para autorizaciones pendientes. **Objetivos:** OE1 y preparación de OE3–OE5.

### Fase 2. Diseño pedagógico, instrumentos y sistema — semanas 3–4

**Actividades:** diseñar flujos de estudiante e investigador, modelo de datos y prototipo de pantallas; preparar tabla de especificaciones del pretest/postest, rúbrica y encuesta; diseñar plantillas y simulaciones; definir reglas adaptativas y comenzar revisión por expertos.

Preferir un mecanismo adaptativo sencillo y explicable para esta versión. Documentar cómo se inicializa el dominio, qué evidencia permite avanzar, cuándo se ofrece refuerzo y cómo se evita repetir excesivamente un ejercicio. Los umbrales son parámetros propuestos a revisar en el piloto, no valores pedagógicos ya validados. Elo o BKT solo se incorporarán si el equipo puede justificar y verificar su uso dentro del plazo.

**Entregables:** prototipo navegable, modelo de datos, diccionario inicial, instrumentos en primera versión y especificación del motor adaptativo.

**Criterio de cierre:** cada dato requerido por la tesis tiene fuente y mecanismo de captura; los instrumentos cubren los aprendizajes seleccionados. **Objetivos:** OE1, OE2 y OE3.

### Fase 3. Desarrollo del núcleo — semanas 5–6

**Actividades:** implementar acceso y permisos, catálogo, presentación de ejercicios, validación de respuestas, almacenamiento de intentos y administración del banco. Construir una primera secuencia completa: ingresar, resolver, recibir retroalimentación y recuperar el intento en una exportación.

**Entregables:** versión funcional del núcleo y primer conjunto de plantillas revisadas.

**Criterio de cierre:** la secuencia completa funciona y conserva los datos correctamente. La verificación matemática contempla dominio, expresiones equivalentes, entradas inválidas y tolerancias cuando correspondan; no delega la calificación a un modelo generativo. **Objetivos:** OE2 y OE3.

### Fase 4. Adaptación y recursos — semanas 7–8

**Actividades:** integrar diagnóstico, estado de dominio, selector de ejercicios, rutas de refuerzo, pistas y tres simulaciones. Completar el banco acordado, revisar contenido con el docente y registrar las iteraciones realizadas con vibe coding.

**Entregables:** versión integrada del aprendizaje adaptativo, banco revisado y bitácora de producción de recursos.

**Criterio de cierre:** perfiles simulados con desempeños distintos reciben recomendaciones coherentes con las reglas; cada recurso publicado cuenta con revisión y versión identificable. **Objetivos:** OE2 y OE3.

### Fase 5. Instrumentación y validación — semana 9

**Actividades:** finalizar panel, encuesta, importación de resultados externos y exportaciones; completar revisión de expertos y ajustes; comprobar relación entre códigos de estudiantes, grupos, pretest, postest y actividad. Probar respaldos y recuperación.

**Entregables:** instrumentos listos para piloto, diccionario de datos definitivo y exportación de prueba con datos ficticios.

**Criterio de cierre:** el equipo puede reconstruir el conjunto de análisis sin copiar datos manualmente desde pantallas; los accesos impiden consultar resultados de otros estudiantes. **Objetivos:** OE4 y OE5.

### Fase 6. Piloto y estabilización — semana 10

**Actividades:** realizar un piloto con 5–8 participantes de perfil semejante, preferentemente fuera de la muestra principal; observar comprensión de instrucciones, tiempos, errores matemáticos, facilidad de uso y captura de datos. Ensayar aplicación y corrección de instrumentos.

El piloto sirve para detectar problemas operativos; su pequeño tamaño no basta para afirmar que quedaron demostradas las propiedades psicométricas de los instrumentos.

**Entregables:** informe de piloto, incidencias corregidas y versión candidata para campo.

**Criterio de cierre:** no quedan errores que alteren calificaciones, pierdan registros o impidan completar las actividades esenciales. **Objetivos:** OE2 y OE3.

### Fase 7. Preparación de campo y pretest — semana 11

**Actividades:** confirmar permisos y participación, aplicar consentimiento, registrar códigos y grupos; administrar el pretest a ambos grupos bajo condiciones comunes; capacitar al grupo experimental en el uso de la plataforma y realizar el diagnóstico interno; fijar versión de aplicación, banco y reglas.

**Entregables:** base inicial resguardada, acta de aplicación, registro de participantes y versión liberada.

**Criterio de cierre:** pretest y diagnóstico interno permanecen diferenciados; la plataforma está operativa y el protocolo de intervención está cerrado. **Objetivos:** OE1 y OE5.

### Fase 8. Intervención educativa — semanas 12–17

**Actividades:** seis semanas de uso de la aplicación por el grupo experimental, mientras el control continúa con la enseñanza prevista. Propuesta de carga: dos sesiones de 30–40 minutos por semana, a acordar con el docente. Precisar si sustituyen práctica habitual o añaden tiempo de estudio y registrar esta diferencia en la interpretación.

Programar recursos según la secuencia real del curso. Revisar semanalmente acceso, participación, pérdida de datos e incidencias. No cambiar las reglas adaptativas ni el contenido evaluado a partir de resultados parciales. Las correcciones críticas deben registrar motivo, fecha, versión y participantes afectados. La adaptación prevista por las reglas continúa funcionando normalmente.

**Entregables:** registros semanales de uso, asistencia, actividades de ambos grupos, incidencias y respaldos.

**Criterio de cierre:** se completan las seis semanas y se documentan exposición real, ausencias y desviaciones del protocolo. **Objetivos:** OE3 y OE5.

### Fase 9. Postest y cierre de recolección — semana 18

**Actividades:** aplicar el postest a ambos grupos con condiciones y rúbrica comunes; administrar encuesta de utilidad al experimental; obtener notas oficiales autorizadas cuando estén disponibles; cerrar registros de uso y documentar retiros o datos faltantes. Ofrecer acceso posterior al control según lo acordado.

**Entregables:** base de cierre, encuestas, actas y relación de datos faltantes. Si las notas finales aún no existen, fijar su recolección posterior sin retrasar el análisis del resultado principal.

**Criterio de cierre:** los registros se concilian por código y grupo y queda preservada una copia original. **Objetivos:** OE4 y OE5.

### Fase 10. Procesamiento y análisis — semanas 19–20

**Actividades:** depurar duplicados, verificar rangos y documentar exclusiones y datos faltantes; describir resultados iniciales y finales, participación y percepciones; ejecutar el análisis acordado antes del campo, incluyendo magnitud del efecto e incertidumbre cuando corresponda.

La ANCOVA sugerida en el contexto queda como candidata a revisión metodológica, no como una decisión automática. Antes del campo, el asesor o especialista debe considerar que solo hay dos secciones y una por condición: las diferencias entre secciones y docentes pueden confundirse con la intervención. Ajustar por pretest no elimina por sí solo ese problema. No asumir independencia de 60 observaciones ni equivalencia inicial solo porque una prueba no sea significativa. Si es viable incorporar más secciones, reconsiderarlo en la fase 1.

No elegir el análisis únicamente por una prueba de normalidad. Dejar por escrito resultado principal, covariables, supuestos, tratamiento de ausencias y alcance de las conclusiones. El uso de la app y la satisfacción son evidencia complementaria; no sustituyen la medición del rendimiento.

**Entregables:** base de análisis seudonimizada, código o procedimiento reproducible, resultados por objetivo y borrador de discusión.

**Criterio de cierre:** cada resultado puede rastrearse al instrumento y a los datos que lo originan. **Objetivos:** OE4 y OE5.

### Fase 11. Informe y preparación de sustentación — semanas 21–22

**Actividades:** integrar resultados, discusión, limitaciones y conclusiones; revisar coherencia entre resumen, método y anexos; incorporar observaciones del asesor; preparar presentación, demostración y manuales.

La escritura comienza desde la semana 1: metodología en semanas 1–4, desarrollo y validación en semanas 5–10, ejecución en semanas 11–18 y resultados en semanas 19–20. Estas dos últimas semanas se reservan para integración y correcciones.

**Entregables:** informe listo para revisión institucional, presentación, aplicación documentada y paquete de evidencias. La fecha oficial de sustentación depende del trámite universitario y no se presume incluida en las 22 semanas.

**Criterio de cierre:** conclusiones responden a los objetivos sin afirmar efectos no demostrados; se dispone de una demostración y respaldo reproducible.

## 5. Distribución propuesta del trabajo

- **Sebastian:** coordinación técnica, backend, datos, motor adaptativo, despliegue y exportación.
- **Joseph:** interfaz, simulaciones, integración del banco e instrumentos, documentación de uso.
- **Ambos:** coordinación de campo, revisión cruzada, bitácora de vibe coding, validación, análisis y redacción. Ninguno debe ser el único que conozca el funcionamiento completo.
- **Asesor:** revisión metodológica, coherencia del informe, decisiones de análisis y evaluación de conclusiones.
- **Docente de Cálculo I:** secuencia curricular, revisión matemática y pedagógica, instrumentos y coordinación de sesiones.

Esta distribución es una propuesta organizativa y puede intercambiarse según experiencia y disponibilidad. La revisión del docente y del asesor debe agendarse desde la primera fase.

## 6. Seguimiento, evidencias y criterios de avance

Trabajar en ciclos de dos semanas durante el desarrollo y realizar una revisión semanal breve de entregables, bloqueos y próximos pasos. Cada tarea del tablero debe indicar responsable, objetivo específico, dependencia, evidencia y criterio de aceptación.

Conservar una bitácora de vibe coding por recurso o cambio relevante: propósito pedagógico, herramienta y modelo utilizados, fecha, instrucción o resumen del prompt, versión generada, errores encontrados, correcciones humanas, pruebas y aprobación del docente. No incluir información identificable de estudiantes en prompts.

Para cada objetivo, conservar la siguiente evidencia:

- **OE1, dificultades:** diagnóstico de necesidades, revisión del sílabo y resultados iniciales pertinentes.
- **OE2, aplicación:** requisitos, diseño, versiones, pruebas y demostración funcional.
- **OE3, recursos:** plantillas, simulaciones, reglas de adaptación, revisiones e iteraciones documentadas.
- **OE4, percepción:** instrumento revisado, respuestas y análisis por ítem o dimensión justificada.
- **OE5, efectividad:** protocolo, pruebas académicas, rúbricas, base de datos y análisis reproducible.

La ruta crítica es: acceso a secciones y sílabo → protocolo e instrumentos → recursos revisados y aplicación → piloto → pretest → seis semanas de uso → postest → análisis → informe. Si aparece un retraso, retirar primero funcionalidades opcionales o desplazar el calendario.

## 7. Datos, riesgos y presupuesto

### Manejo de datos

Usar códigos de participante; mantener la correspondencia con nombres separada y con acceso restringido. Mientras exista esa correspondencia, los datos son seudonimizados, no completamente anónimos. Definir responsables de acceso, conservación y eliminación en el protocolo. Mantener copia original de datos y una copia de trabajo, junto con el historial de transformaciones.

Las formas A/B del pretest y postest deben cubrir los mismos aprendizajes y contar con revisión de comparabilidad; llamarlas equivalentes no demuestra equivalencia. Aplicar en cada momento las mismas condiciones a ambos grupos y evitar exposición previa a los ítems de evaluación en el banco de práctica.

### Riesgos prioritarios y respuesta

- **Secciones o autorizaciones no disponibles:** resolver durante semanas 1–2 y reprogramar campo antes de comprometer fechas.
- **Alcance excesivo:** priorizar unidad curricular, 36 plantillas propuestas y tres simulaciones; retirar IA en tiempo real si compromete estabilidad.
- **Errores matemáticos:** revisión docente, restricciones de parámetros y pruebas sobre casos válidos e inválidos antes de publicar.
- **Baja participación o abandono:** registrar asistencia y exposición; acordar recordatorios y soporte, sin eliminar estudiantes a posteriori para favorecer resultados.
- **Contaminación entre grupos:** restringir acceso durante campo y registrar uso de otros recursos y posibles intercambios.
- **Caída de plataforma:** ensayar recuperación, mantener respaldos y documentar actividades o sesiones reprogramadas.
- **Confusión entre sección e intervención:** revisar viabilidad de más secciones y declarar límites del diseño adoptado.

### Actualización presupuestal pendiente

El informe consigna S/ 725.99 como presupuesto original. No se adopta el total actualizado del texto previo porque el presente cronograma tiene otra duración y las tarifas no se han verificado.

En la semana 2, recalcular meses efectivos de internet y alojamiento, impresión de instrumentos, movilidad, respaldos y contingencia de IA propuesta de S/ 100. Diferenciar herramientas de desarrollo de consumo por API. Las pruebas previas y la conservación del sistema durante el análisis también necesitan cobertura. Revisar además el redondeo de Railway: el informe muestra S/ 66.90 por tres meses y un subtotal de S/ 200.69.

El presupuesto definitivo debe separar gastos adicionales del proyecto y recursos ya disponibles. No contratar servicios hasta conocer los costos aplicables y la aprobación del equipo.

## 8. Acciones de la primera semana

1. Reunir sílabo vigente, calendario de evaluaciones y disponibilidad de las secciones.
2. Revisar con el asesor muestra, selección/asignación, duración, resultado principal y alcance de Hi(3).
3. Elegir con el docente la unidad de seis semanas y enumerar sus subtemas.
4. Acordar disponibilidad de los dos investigadores y asignación de responsabilidades.
5. Abrir el tablero y convertir la fase 1 en tareas con responsable y fecha.
6. Preparar la matriz objetivo–indicador–instrumento y el primer borrador del protocolo.

**Resultado esperado al terminar la semana 1:** un alcance concreto y revisable, con las decisiones pendientes identificadas, antes de comenzar a construir la aplicación.

## Fuentes de contexto

- Informe Tesis I.md proporcionado por el usuario: objetivos, metodología, hipótesis, cronograma y presupuesto.
- Primer texto adjunto: propuesta previa de arquitectura, funcionalidades y planificación.
- Segundo texto adjunto: propuestas de ajuste metodológico, duración, instrumentos y costos.

Los volúmenes de recursos, dedicación, reparto de tareas y cronograma de 22 semanas son propuestas de este plan, no hechos confirmados por las fuentes ni compromisos asumidos por el asesor o la universidad.
