# Entrega 01 · Base funcional

Fecha: 29 de septiembre de 2026. Inicio de implementación solicitado por el usuario; se mantiene pendiente el cierre de sílabo y coordinación de campo.

## Decisiones

- Se usa el repositorio existente `calculo-adaptativo-upao` sin modificar su remoto.
- React/TypeScript y FastAPI conservan el stack del plan.
- SQLite permite ejecutar la demo sin administrar un servidor adicional. SQLAlchemy permite configurar PostgreSQL, pendiente de verificar con una instancia real.
- El catálogo demo tiene dos temas y seis combinaciones tema–nivel; no equivale al banco validado de 36 plantillas.
- La calificación acepta números o fracciones exactas. No admite respuestas simbólicas; el enunciado pide siempre un valor numérico.
- Los ejercicios conservan respuesta esperada y parámetros expresados en el enunciado en el servidor. La respuesta y explicación no se entregan hasta enviar el intento.
- Un ejercicio admite un intento evaluado. Repetir la solicitud devuelve el resultado existente; para practicar otra vez se genera un nuevo ejercicio.
- Se guarda versión `demo-1`, momento de creación y envío UTC y uso de pista. El intervalo entre ambas marcas no debe interpretarse como tiempo efectivo de estudio.
- La simulación explica f(x)=x² y f′(x)=2x; no registra todavía eventos experimentales.

## Validación prevista

Build TypeScript/Vite; pruebas de aislamiento entre sesiones, validación numérica, ausencia de soluciones en la emisión, reenvío de intentos, exportación y límites de adaptación; comprobación visual y del flujo en navegador.

## Próximas tareas

1. Autenticación real, roles y administración de participantes sin datos reales durante desarrollo.
2. Separación de generación, verificación, adaptación y persistencia en módulos.
3. Migraciones y verificación PostgreSQL.
4. Catálogo revisable, bitácora de recursos y pruebas matemáticas ampliadas.
5. Diagnóstico interno separado de instrumentos de investigación.
6. Ampliación curricular y validación docente según sílabo.

No se publica esta demo ni se presenta como lista para intervención.

## Comprobación de entrega

La compilación TypeScript/Vite se completó correctamente. Se incluyen pruebas de API, persistencia tras reinicio y generación de derivadas. La integración PostgreSQL y el flujo de CI en GitHub quedan pendientes de ejecutarse en sus entornos respectivos.

Resultado local: ocho pruebas aprobadas. La suite emite una advertencia de deprecación del cliente httpx de Starlette, sin fallos. Se usó una carpeta temporal nueva para evitar un conflicto de permisos del entorno Windows. La inspección visual no pudo completarse: el navegador integrado agotó el tiempo de conexión y Chrome no estaba disponible para la herramienta.

La prueba HTTP integrada a través del proxy Vite confirmó creación de sesión, catálogo, pistas, tres envíos correctos, consulta de progreso y avance a nivel 2. Script reproducible: `backend/tests/smoke_local.py`. Para esta entrega la interfaz quedó en http://127.0.0.1:5174 y la API en http://127.0.0.1:8001, porque los puertos predeterminados estaban ocupados.
