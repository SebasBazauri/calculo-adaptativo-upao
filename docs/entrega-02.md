# Entrega 02 · Teoría y laboratorio GeoGebra

Fecha: 30 de septiembre de 2026.

## Cambios

- Catálogo de seis lecciones con búsqueda y filtro por límites/derivadas. Incluye títulos, subtítulos, objetivos, explicaciones, fórmulas, ejemplos paso a paso y preguntas.
- Una actividad GeoGebra por lección. La selección de tema modifica las actividades disponibles y las construcciones iniciales.
- Puntos móviles, referencia de límite, hueco, salto, secante, función derivada y tangente según actividad.
- Deslizadores conectados mediante `setValue`, reinicio completo y redimensionado. El control h de la secante evita cero y explora aproximación positiva; la explicación señala esta restricción.
- Carga de GeoGebra al entrar al laboratorio, con estados de espera/error y reintento. Teoría disponible sin depender del backend de práctica.
- Enlaces teoría–laboratorio–práctica. Volver a teoría desde una actividad selecciona su lección.
- Instrucciones de mantenimiento en `AGENTS.md`, decisiones y pendientes en `memory.md`, descripción de uso en `README.md`.

El catálogo es contenido editorial versionado en código, no un panel de administración ni una tabla de base de datos. El backend y los registros existentes no fueron modificados.

## Comprobaciones

- Compilación TypeScript/Vite.
- Comprobación local de identificadores únicos, relación uno a uno entre seis lecciones y seis actividades, tema correspondiente, ejemplos completos, rangos de controles y límites de vista.
- Pendiente: ejecución real del SDK, comandos y herramientas en navegador; navegación visual y vista móvil. La herramienta de navegador fue bloqueada por un fallo de revisión automática debido a créditos agotados del espacio de trabajo. No se usó otro mecanismo para eludir esa revisión.

La comprobación estructural y el build no prueban que el proveedor externo cargue en el navegador del usuario. Si una construcción no se inicializa, la interfaz muestra error y permite reintentar.

## Referencias de integración

- [GeoGebra Apps Embedding](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/).
- [GeoGebra App Parameters](https://geogebra.github.io/docs/reference/en/GeoGebra_App_Parameters/).
- [GeoGebra Apps API](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/).

Se utiliza el script oficial `https://www.geogebra.org/apps/deployggb.js`. No requiere una clave propia para esta incrustación. Su descarga y ejecución requieren internet. No se envían explícitamente tokens de sesión, respuestas o datos personales a las construcciones.

## Pendientes académicos

Revisar teoría, ejemplos y actividades con el docente y contrastar con el sílabo. Las escenas no cuentan como recursos validados ni registran mediciones experimentales.
