# Entrega 03 · Autoevaluaciones, historial y rendimiento

## Inspección previa y diseño

Se inspeccionaron archivos fuente, configuración, documentación, pruebas y estructura antes de implementar. Se confirmó React/TypeScript/Vite, FastAPI/Python, SQLAlchemy/SQLite y SymPy. No existe router frontend dedicado: `App.tsx` cambia vistas mediante estado. No hay framework de tests frontend ni comando de lint; `npm run build` ejecuta el type-check. Backend usa pytest y TestClient.

La identidad existente es `demo_learners.token`, que representa una sesión demo, no una relación usuario–estudiante verificada. No existen roles ni cursos normalizados. `exercises` y `attempts` pertenecen a la práctica, con generación y corrección en servidor. No había modelo de examen, calificación agregada ni migraciones registradas.

Se decidió reutilizar la sesión y funciones de generación/corrección, extraer modelos y ejercicios a módulos y agregar el módulo `exams.py`. No se reutilizan filas de práctica porque hacerlo permitiría revelar soluciones con los endpoints de práctica y contaminar sus estadísticas. Los exámenes mantienen snapshots propios y no afectan el motor adaptativo.

Archivos previstos y finalmente modificados: `backend/app/main.py`, nuevos `models.py`, `exercises.py`, `exams.py`, `migrations.py`; `src/App.tsx`, `src/styles.css`, nuevos `src/exams.ts`, `ExamGenerator.tsx` y `ExamHistory.tsx`; pruebas y documentación. No se agregaron paquetes ni se actualizaron versiones.

## Modelo y migración

- `exams`: sesión propietaria, identificador de solicitud para generación idempotente, curso fijo Cálculo I, tema, nivel, número de preguntas, fechas y agregados de resultado. Un examen generado representa un intento; para intentar de nuevo se genera otro examen.
- `exam_questions`: relación con examen, posición única y snapshot de enunciado, fórmula, tema, nivel, respuesta correcta, explicación y versión del recurso.
- `exam_responses`: una respuesta por pregunta; conserva texto y corrección. Las omitidas se almacenan con cadena vacía y resultado incorrecto.
- `schema_migrations`: registro de versiones. 001 reconoce el esquema de práctica legado; 002 crea las tablas de exámenes. La migración es aditiva y repetible, aplicada en el arranque. No modifica columnas existentes.

La generación de límites de nivel 3 incorpora coeficientes y constantes para permitir hasta 20 preguntas distintas. Las preguntas nuevas guardan `demo-2`; los snapshots anteriores no se regeneran ni se actualizan.

Antes de actualizar la base local se guardó una copia SQLite en `backend/backups/`, excluida de Git por `*.db`. Se compararon los registros legados antes y después: 3 sesiones, 12 ejercicios y 10 intentos preservados. `integrity_check` devolvió `ok`; `foreign_key_check` no encontró infracciones. Estos conteos describen la comprobación de migración, no el estado posterior a los smoke tests.

No hay migración descendente automática. Los cambios futuros de columnas requieren una revisión explícita y respaldo. Arrancar un solo proceso de migración a la vez; PostgreSQL no se ha probado contra una instancia real.

## API y reglas

- `POST /api/exams`: `request_id` UUID, tema `limits`, `derivatives` o `mixed`, nivel entero 1–3 y 3–20 preguntas. Curso y tipo de respuesta se mantienen fijos; no se inventa selección de cursos ni temporizador.
- `GET /api/exams?offset=0&limit=10`: historial propio paginado, con exámenes pendientes y finalizados.
- `GET /api/exams/metrics`: métricas de exámenes finalizados de la sesión.
- `GET /api/exams/{id}`: preguntas y estado; soluciones/explicaciones solo después del envío.
- `POST /api/exams/{id}/submit`: respuestas por ID de pregunta. Calificación en servidor, sin aceptar puntajes del cliente.

Todos los endpoints requieren la sesión. Consultar/enviar exámenes ajenos devuelve 404; sin sesión válida devuelve 401. Se rechazan parámetros, IDs duplicados o ajenos y expresiones numéricas inválidas. Los campos adicionales de generación/envío se rechazan.

La finalización reclama el examen con una actualización condicional y confirma respuestas y agregados en la misma transacción. Reenviar las mismas respuestas devuelve el resultado original; cambiarlas devuelve 409. Repetir generación con el mismo `request_id` no crea otro examen; reutilizarlo con parámetros distintos devuelve 409.

## Puntajes y métricas

Cada pregunta pesa igual. Puntaje = 20 × correctas / preguntas; porcentaje = 100 × correctas / preguntas. Incorrectas incluye omitidas; se informa además el número de respondidas y omitidas. El tiempo transcurrido se calcula con fechas UTC del servidor e incluye pausas; no es tiempo activo ni tiene límite máximo impuesto.

El promedio por examen usa el mismo peso para cada examen. El acierto global por pregunta usa el total de preguntas como denominador. Se muestran total de finalizados, promedio 0–20, porcentaje promedio, aciertos globales, preguntas respondidas, errores/omitidas, desglose por tema y evolución cronológica. Los exámenes pendientes se excluyen. Un examen mixto contribuye al tema de cada pregunta. La sugerencia de repaso usa el menor porcentaje observado y no se presenta como diagnóstico validado.

## Frontend y estados

`Generar examen` ofrece parámetros compatibles con el banco, preguntas numéricas, borrador local, confirmación de envío y resultado con revisión por pregunta. Los borradores no se sincronizan al servidor; las preguntas sí se conservan al generarse y pueden retomarse desde el historial. Si el almacenamiento local falla, la interfaz lo indica.

`Historial de exámenes` muestra fecha, curso/tema/nivel, preguntas, puntaje/porcentaje, aciertos/errores, tiempo y estado. Permite continuar pendientes o abrir detalle finalizado. Incluye métricas reales y gráfico SVG de los últimos diez envíos, sin nueva librería.

Se contemplan generación/carga/envío, errores con reintento, vacío, en progreso y resultado; se mantiene diseño, navegación, etiquetas y reglas responsive existentes. Los errores del backend en parámetros o respuestas no alteran un examen pendiente.

## Verificación

Suite local: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider`: **39 pruebas aprobadas**. Incluye nueve combinaciones de tema/nivel, validación de parámetros, exposición de soluciones, idempotencia, concurrencia, autorización, migración y persistencia, además de comprobación simbólica de límites en los tres niveles. Persiste la advertencia previa de deprecación del cliente httpx de Starlette.

Type-check y build: `npm.cmd run build`: **aprobados**, sin errores de compilación. Se añadió `tests/smoke_exams.py` para el recorrido HTTP completo y se conserva `tests/smoke_local.py` para regresión de práctica. Los scripts crean datos únicamente en sesiones demo nuevas.

Ambos smoke tests pasaron a través de `http://127.0.0.1:5174`, conectado a la API actualizada en 8001. El primer intento encontró la interfaz detenida; se reinició Vite y se repitieron ambos con éxito. Se verificaron creación, envío, resultado, historial, métricas, rechazo de otra sesión y flujo de práctica anterior.

No se añadió framework de tests frontend, dado que no existe uno y la tarea no lo requiere en ese caso. La inspección visual sigue pendiente por el bloqueo de revisión automática de navegador comunicado previamente (créditos del espacio agotados). La ejecución HTTP no sustituye una prueba de interacción visual.

## Tesis y límites

Las autoevaluaciones no son pretest/postest ni notas oficiales. Se revisó la documentación metodológica del repositorio y el informe original disponible fuera de él. Las recomendaciones específicas se guardan en `docs/mejoras-desde-la-tesis.md`.

Continúan pendientes cuentas reales, roles, validación docente e instrumentos de investigación, además de verificación visual y PostgreSQL. Son límites explícitos del prototipo, no funcionalidades simuladas en esta entrega.
