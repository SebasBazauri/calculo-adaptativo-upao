# Cálculo adaptativo UPAO

Aplicación web de recursos académicos adaptativos para Cálculo I, desarrollada como parte del proyecto de tesis de Angel Sebastian Bazauri Villanueva y Joseph Kevin Salinas Rojas.

## Primera entrega · 0.1.0

### Ampliación: catálogo y GeoGebra

La navegación incluye **Catálogo teórico**, con búsqueda, filtro por tema y seis lecciones: idea de límite, indeterminación/factorización, límites laterales/continuidad, secante y derivada, reglas básicas y ecuación de la tangente. Cada lección tiene objetivo, títulos, subtítulos, explicación y ejemplo resuelto.

El **Laboratorio visual** permite elegir tema y actividad. Usa la API JavaScript oficial de GeoGebra para crear construcciones específicas y actualizar sus parámetros. Incluye límites con puntos móviles, hueco y salto; secante/tangente; función derivada y pendiente. Desde una lección se abre su actividad, y desde el laboratorio se puede volver a su teoría o practicar el tema.

El SDK se descarga desde GeoGebra al abrir el laboratorio; requiere internet y muestra error/reintento si no está disponible. No requiere una API key. La teoría está incluida en el frontend y no depende de la API de práctica. Los contenidos continúan pendientes de revisión docente y el laboratorio no registra eventos de investigación.

Archivos: `src/content/catalog.ts`, `src/content/labs.ts` y `src/components/`. Referencias: [incrustación oficial](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/) y [API oficial](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/).

### Base de la aplicación

- Interfaz React y TypeScript: aprendizaje, laboratorio visual y progreso.
- API FastAPI con sesiones de demostración independientes.
- Ejercicios paramétricos de límites y derivadas en tres niveles.
- Verificación exacta de respuestas numéricas con SymPy, sin ejecutar expresiones del usuario.
- Pistas y explicación tras el envío, con registro persistente de intentos.
- Regla adaptativa inicial: tres aciertos seguidos suben un nivel; un error reduce uno. Límites: niveles 1–3.
- Laboratorio GeoGebra con seis actividades sobre límites y derivadas.
- Exportación CSV de los intentos de la sesión actual.

**Estado:** demostración local, contenido pendiente de revisión docente. No es todavía la plataforma de intervención de la tesis. No introducir datos de estudiantes reales.

## Requisitos

Node.js 22.12 o superior y Python 3.12. La primera instalación necesita acceso a internet.

### Instalar

Desde la raíz del repositorio, en PowerShell:

```powershell
npm.cmd ci
py -3.12 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.lock.txt
```

Si Python está disponible como `python` en lugar de `py`, usar `python -m venv backend/.venv`. El entorno virtual creado en este equipo queda excluido de Git.

### Ejecutar

Primera terminal, desde la raíz:

```powershell
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Segunda terminal, desde la raíz:

```powershell
npm.cmd run dev
```

Abrir http://127.0.0.1:5173. Documentación de la API: http://127.0.0.1:8000/docs.

Vite reenvía `/api` al servidor local. Mantener los dos procesos activos. `npm run preview` solo sirve el frontend compilado y no configura un proxy de API; para probar el flujo integrado usar `npm run dev`.

Si los puertos están ocupados, iniciar la API con `--port 8001` y la interfaz así:

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:8001'
npm.cmd run dev -- --port 5174
```

En ese caso, abrir http://127.0.0.1:5174.

### Verificar

```powershell
npm.cmd run build
cd backend
.venv/Scripts/python.exe -m pytest -q
```

## Datos y configuración

Por defecto, la API crea `backend/calculo.db` al iniciarse desde `backend`. Los intentos se conservan al reiniciar. El navegador conserva un token de demostración en almacenamiento local; al borrar ese almacenamiento se pierde acceso desde ese navegador a la sesión anterior. La exportación solo incluye esa sesión y nunca contiene su token.

`DATABASE_URL` permite elegir PostgreSQL mediante SQLAlchemy. Ejemplo en PowerShell, antes de iniciar la API:

```powershell
$env:DATABASE_URL = 'postgresql+psycopg://usuario:clave@localhost:5432/calculo'
```

`backend/.env.example` documenta la variable, pero el servidor no carga archivos `.env` automáticamente. No subir credenciales. El esquema se crea con `create_all` solo para este prototipo; incorporar migraciones antes de modificar un esquema usado en campo. PostgreSQL requiere una instancia propia y su integración aún no está verificada.

## Estructura

```text
src/                    Interfaz y cliente de API
public/                 Favicon
backend/app/            API, persistencia y ejercicios
backend/tests/          Pruebas de API y adaptación
docs/                   Planificación y alcance de la entrega
.github/workflows/      Verificación de build y pruebas
```

## Límites y siguiente incremento

Las sesiones demo no sustituyen autenticación, roles ni consentimiento. El servidor debe permanecer local; antes de publicarlo se necesitan autenticación real, controles de acceso por rol, límites de solicitudes, migraciones y revisión de configuración.

Esta versión no incluye diagnóstico inicial, grupos experimental/control, pretest/postest, cuestionario Likert, panel docente, las 36 plantillas ni las tres simulaciones del plan. Los niveles son una regla operativa de demostración, no una estimación validada del dominio. La práctica registrada no debe confundirse con resultados de investigación.

Próximo incremento: separar módulos del backend, añadir autenticación/roles y catálogo de recursos revisables; cerrar la selección curricular con el sílabo antes de ampliar el banco.

Las fuentes tipográficas web son opcionales: si no cargan, se usan fuentes locales de respaldo. La práctica no requiere un servicio de IA en tiempo real.
