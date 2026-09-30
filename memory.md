# Memoria del proyecto

Última actualización: 30 de septiembre de 2026. Este archivo registra contexto para continuar el trabajo; no sustituye el código, las instrucciones de `AGENTS.md` ni la verificación del estado actual.

## Identidad

- Repositorio: `calculo-adaptativo-upao`.
- Remoto observado: `https://github.com/SebasBazauri/calculo-adaptativo-upao.git`.
- Título descriptivo del producto: Recursos académicos adaptativos para Cálculo I desarrollados mediante vibe coding.
- Título del informe: Mejora de rendimiento académico de Cálculo I en estudiantes de ingeniería UPAO mediante el uso de recursos académicos generados con vibecoding.
- Autores: Angel Sebastian Bazauri Villanueva y Joseph Kevin Salinas Rojas.
- Asesor mencionado en el informe: Walter Manuel Cueva Chavez. No se ha contactado al asesor desde este chat.

## Acuerdos y alcance

El usuario aceptó el plan de 22 semanas, autorizó iniciar la fase 1 y posteriormente pidió comenzar la aplicación. Se adelantó una base técnica de demostración mientras continúa pendiente el cierre curricular y metodológico.

El plan contempla seis semanas de uso, precedidas por pretest y seguidas por postest. El escenario es de 60 estudiantes, aproximadamente 30 por grupo; la matrícula y las secciones reales no se han confirmado. Límites y derivadas son el alcance curricular propuesto. Las 36 plantillas y tres simulaciones son metas del plan, no entregables ya completados.

La aceptación del usuario no constituye aprobación del asesor, revisión docente, autorización institucional ni validación de instrumentos. No se han realizado piloto, intervención ni análisis de resultados reales.

Preferencias observadas: comunicación en español, trabajo concreto sobre archivos y continuidad sin pedir reiteradamente aprobación para tareas ya autorizadas.

## Estado implementado · versión 0.1.0

- React/TypeScript/Vite con vistas de aprendizaje, laboratorio visual y progreso.
- FastAPI con sesiones demo independientes, ejercicios, pistas, envío de respuestas, progreso, exportación CSV y módulo de autoevaluaciones con historial/métricas.
- Persistencia SQLAlchemy con SQLite local. Configuración PostgreSQL disponible, aún sin prueba contra una instancia real.
- Dos temas: límites y derivadas, con tres niveles por tema. No existe aún el banco validado de 36 plantillas.
- Verificación exacta de respuestas numéricas y fracciones mediante SymPy; no se admiten respuestas simbólicas.
- Regla demo: tres aciertos consecutivos suben un nivel; un error reduce uno. Nivel mínimo 1 y máximo 3.
- Un intento evaluado por ejercicio, reenvío idempotente y control de pertenencia a la sesión.
- Registro de versión `demo-1`, momentos UTC y uso de pista. Una pista posterior al envío no modifica ese registro.
- Laboratorio ampliado con API JavaScript de GeoGebra y seis actividades elegibles por tema; reemplaza la simulación SVG del laboratorio. La gráfica ilustrativa de portada permanece. No registra eventos experimentales.
- Workflow de GitHub Actions para build y pruebas creado; ejecución remota no verificada.

## Pendientes de producto

1. Autenticación real y permisos por rol; las sesiones demo no son cuentas de estudiantes.
2. Continuar modularización donde resulte necesaria. Ya se separaron modelos/generación/exámenes y se agregaron migraciones aditivas; futuros cambios de columnas necesitan nuevas revisiones explícitas.
3. Verificación de integración PostgreSQL.
4. Administración y revisión docente de recursos, con bitácora de producción.
5. Diagnóstico interno y adaptación revisada pedagógicamente.
6. Grupos de investigación, instrumentos, encuesta y panel docente.
7. Ampliación del banco y simulaciones conforme al sílabo.
8. Revisión visual y de accesibilidad en navegador; publicación solo cuando se prepare y solicite.

## Dependencias de la investigación

Faltan el sílabo vigente, fecha prevista de intervención y acceso a secciones. Se solicitaron al usuario, sin respuesta registrada al preparar esta memoria. No cerrar subtemas ni fechas de campo por inferencia.

Separar rendimiento académico objetivo de percepción de utilidad. La hipótesis original sobre el efecto causal de las iteraciones de recursos necesita revisión: contar cambios no demuestra que produzcan una mejora. El análisis estadístico tampoco está cerrado; una sección por condición limita la separación del efecto de sección y de intervención.

## Verificación realizada

En la entrega 01:

- Compilación TypeScript y Vite exitosa.
- Ocho pruebas de backend aprobadas: aislamiento, validación de entradas, equivalencia numérica, reenvío, adaptación, persistencia y generación de derivadas.
- Prueba HTTP a través de Vite exitosa: sesión, catálogo, pistas, tres respuestas correctas, progreso y avance a nivel 2.
- Advertencia de deprecación de httpx en el cliente de pruebas de Starlette; no produjo fallos.
- Conflicto local de permisos de pytest resuelto para esa ejecución usando una carpeta temporal nueva. No asumir que requiere el mismo tratamiento en otros equipos.
- Inspección visual no completada: el navegador integrado agotó el tiempo de conexión y Chrome no estaba disponible para la herramienta. La pestaña abierta posteriormente por el usuario no demuestra que el agente haya inspeccionado el resultado.

Estos resultados corresponden a esa versión. Repetir las comprobaciones pertinentes cuando cambie el código.

## Entorno local conocido

Checkout usado: `E:/TESIS/calculo-adaptativo-upao`, Windows/PowerShell. Usar rutas relativas al repositorio en código y documentación portátil.

Los puertos predeterminados 5173/8000 estaban ocupados durante la entrega, por lo que se inició frontend en 5174 y backend en 8001 con `API_PROXY_TARGET=http://127.0.0.1:8001`. Verificar disponibilidad y salud antes de reutilizarlos; la memoria no garantiza que estén activos.

La API crea `calculo.db` en su directorio de trabajo y aplica las migraciones registradas al arrancar. Iniciarla desde `backend` para mantener la ubicación documentada. `.env.example` es informativo: no hay carga automática de `.env`. `npm run preview` no configura el proxy API.

Dependencias instaladas en `node_modules` y `backend/.venv`, excluidas de Git junto con las bases y temporales. Los archivos fuente figuraban sin seguimiento en la última consulta de Git; no se ha realizado commit ni push desde este chat. Comprobar el estado antes de cualquier operación Git.

## Documentación de referencia

- `README.md`: instalación, ejecución, alcance y limitaciones técnicas.
- `docs/plan-de-trabajo.md`: plan aceptado.
- `docs/01-protocolo-preliminar.md`: borrador metodológico.
- `docs/02-matriz-objetivos-instrumentos.md`: relación entre objetivos, indicadores y fuentes.
- `docs/03-tablero-fase-1.md`: tareas y decisiones pendientes.
- `docs/entrega-01.md`: decisiones y evidencia de la primera implementación.

El informe original se proporcionó fuera del repositorio como `D:/Informe Tesis I.md`; no fue modificado. Las copias de planificación dentro de `docs/` son la referencia de trabajo del repositorio. Evitar mantener nuevas versiones divergentes en la carpeta padre.

## Próximo paso sugerido

Verificar carga real de GeoGebra, cambio de actividad, deslizadores, reinicio y vista móvil cuando se restablezca el acceso a la herramienta del navegador. Después, avanzar en autenticación/roles y modularización sin introducir datos reales. Incorporar el sílabo cuando el usuario lo proporcione antes de ampliar definitivamente los recursos académicos.

## Ampliación solicitada · 30 de septiembre de 2026

El usuario pidió contenido teórico en un catálogo, laboratorio conectado con GeoGebra y herramientas por tema, y actualización de los archivos de memoria/instrucciones.

- `src/content/catalog.ts`: seis lecciones de límites y derivadas, con títulos, subtítulos, objetivos, conceptos, fórmulas, ejemplos resueltos, advertencias y preguntas.
- `src/components/TheoryCatalog.tsx`: búsqueda sin sensibilidad a tildes, filtro temático, lectura y enlaces a práctica/laboratorio. Al volver desde el laboratorio se selecciona su lección.
- `src/content/labs.ts`: seis construcciones, una por lección. Límites: aproximación lineal, hueco y límites laterales. Derivadas: secante, función derivada y tangente.
- `src/components/GeoGebraLab.tsx`: carga del SDK oficial, selección de tema/actividad, control de parámetros vía API, reinicio, redimensionado, timeout y recuperación de errores. No se envían explícitamente datos de participantes ni tokens a GeoGebra.
- Contenido editorial incluido en el frontend; no es un CRUD ni un catálogo persistido en la base de datos. No requiere cambios de esquema ni dependencias npm nuevas.
- El laboratorio usa un servicio externo y requiere internet. Las actividades y teoría siguen pendientes de revisión docente; no confundir seis escenas con las metas pedagógicas validadas del plan.

La comprobación visual fue bloqueada por la revisión automática de la herramienta: espacio de trabajo sin créditos. El mensaje fue un fallo de revisión, no una declaración de que abrir la aplicación fuera inseguro. No se intentó eludirlo con otro mecanismo de automatización del navegador. La verificación real del SDK sigue pendiente hasta restablecer el acceso.

Verificaciones locales de esta ampliación: build TypeScript/Vite exitoso y comprobación de seis correspondencias lección–actividad, identificadores únicos, temas, ejemplos y rangos de control. Detalle en `docs/entrega-02.md`. No se modificó el backend ni se reinterpretaron las ocho pruebas de la entrega anterior como verificación de GeoGebra.

## Autoevaluaciones e historial · entrega 03

Petición del usuario: generador de exámenes, resolución, historial, métricas, recomendaciones vinculadas a tesis y actualización de documentación. Se inspeccionaron configuración, fuentes, pruebas, documentación y el informe original antes de implementar.

### Decisiones estables

- Se conserva la identidad demo. No existen todavía cuentas/roles ni una entidad estudiante distinta de `Learner`. El propietario del examen es la sesión; no es una identidad académica verificada.
- Curso fijo Cálculo I; temas límites, derivadas o mixto; nivel 1–3; 3–20 preguntas numéricas distintas. No se añadió selección ficticia de cursos, tipos de pregunta ni tiempo límite.
- Modelos extraídos a `backend/app/models.py`; generador/corrección a `backend/app/exercises.py`; rutas y servicios nuevos en `backend/app/exams.py`. Dependencias de sesión/DB continúan en `main.py`.
- Tablas nuevas: `exams`, `exam_questions` y `exam_responses`, independientes de práctica. El examen conserva metadatos y resultado; las preguntas conservan snapshots versionados; cada pregunta tiene una respuesta final.
- `schema_migrations` y `migrations.py`: revisión 001 reconoce práctica legada y 002 añade exámenes sin alterar filas previas. Ejecutar un solo arranque/migración a la vez. Las migraciones de columnas y la verificación PostgreSQL siguen pendientes para futuros cambios.
- Cada examen generado es un intento. Una nueva autoevaluación tiene nuevo ID; no se sobrescribe una finalizada. `request_id` hace idempotente la generación repetida.
- Finalización transaccional con actualización condicional: servidor calcula resultados; envío idéntico devuelve el original y uno modificado devuelve 409. No se exponen soluciones antes de finalizar.
- Se amplió la plantilla de límites nivel 3 con coeficientes/constantes para evitar preguntas duplicadas en exámenes largos. Recursos nuevos usan `demo-2`; los históricos conservan su versión y respuesta.

### Navegación y métricas

- Vistas `Generar examen` e `Historial de exámenes` en `App.tsx`, componentes `ExamGenerator.tsx`/`ExamHistory.tsx` y contratos en `src/exams.ts`.
- Borrador de respuestas en almacenamiento local por ID de examen. El servidor conserva preguntas y resultado final, no borradores. Historial permite reanudar o revisar detalles.
- Puntaje = 20 × correctas / preguntas; porcentaje = 100 × correctas / preguntas. Omitidas incluidas entre incorrectas y además contadas separadamente.
- Métricas basadas solo en finalizados: promedio por examen, acierto global ponderado por preguntas, total respondidas/correctas/incorrectas/omitidas, resultados por tema y evolución cronológica. Gráfico SVG sin nueva librería. Los exámenes mixtos se desglosan por tema de pregunta.
- Sugerencia descriptiva para el tema con menor acierto. No constituye diagnóstico validado ni conclusión causal.
- Tiempo = intervalo generación–envío UTC del servidor, incluidas pausas. Estos exámenes no sustituyen pretest/postest ni notas oficiales.

### API, comprobación y documentos

`POST /api/exams`, `GET /api/exams`, `GET /api/exams/metrics`, `GET /api/exams/{id}` y `POST /api/exams/{id}/submit`. Todos requieren sesión y restringen acceso por propietario. Historial paginado mediante offset/limit.

Build/type-check: `npm.cmd run build`. Pruebas desde backend: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider`. Smoke nuevo: `.venv/Scripts/python.exe tests/smoke_exams.py http://127.0.0.1:5174`; se conserva el smoke de práctica. Ambos recorridos HTTP pasaron tras reiniciar los servidores con la API actualizada. Ver resultado final de suite en `docs/entrega-03-examenes.md`.

Se respaldó y migró la base local preservando registros previos; integridad SQLite y claves foráneas verificadas. No se agregaron dependencias. No hay infraestructura de tests frontend ni lint dedicado; se usa el type-check del build. La revisión visual permanece pendiente por el bloqueo de créditos indicado antes.

Plan de mejoras basado en OE1–OE5: `docs/mejoras-desde-la-tesis.md`. Prioriza participantes/roles, recursos revisados, diagnóstico por habilidad, mediciones pre/post separadas, percepción/participación y exportación reproducible. Detalle de arquitectura, decisiones y verificación en `docs/entrega-03-examenes.md`.
