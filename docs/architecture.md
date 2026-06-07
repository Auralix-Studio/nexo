# Arquitectura — cómo Nexo conversa con UPLA

Este documento explica, sin entrar en código fuente, **cómo Nexo hace
las requests** y **dónde guarda qué cosa**. Está orientado a estudiantes
curiosos y a auditores de privacidad.

## Vista general

```
┌──────────────────┐         HTTPS         ┌──────────────────┐
│                  │  ◄────────────────────│                  │
│   Tu teléfono    │                        │  sigma.upla.    │
│   (Nexo app)     │  POST /api/Acceso/...  │  edu.pe         │
│                  │  GET  /api/...         │                  │
│  ┌────────────┐  │                        └──────────────────┘
│  │ AppStore   │  │
│  │ (memoria)  │  │         HTTPS         ┌──────────────────┐
│  └────┬───────┘  │  ◄────────────────────│  intranet.upla. │
│       │          │  POST /...phpcookie    │  edu.pe          │
│  ┌────▼───────┐  │  GET  /...             └──────────────────┘
│  │ SQLite +   │  │
│  │ SharedPref │  │         HTTPS         ┌──────────────────┐
│  │ (en disco) │  │  ◄────────────────────│  login.microsoft │
│  └────────────┘  │  OAuth2 Device Code    │  online.com +    │
│                  │                        │  graph.microsoft │
│  ┌────────────┐  │                        │  .com (opcional) │
│  │ Lumen      │  │                        └──────────────────┘
│  │ (modelo IA │  │
│  │  local)    │  │  NADA AQUÍ
│  └────────────┘  │     Ni servidor de Nexo, ni telemetría,
└──────────────────┘     ni analytics, ni APIs de IA externas.
```

## Las 3 integraciones

### 1. SIGMA (autenticación + datos académicos principales)

- **Endpoint base:** `https://sigma.upla.edu.pe/api`
- **Autenticación:** JWT. La app envía `usuario + contraseña` al
  endpoint `Acceso/Login`, recibe un token, lo guarda en
  `SharedPreferences`, y lo manda como header `Authorization: Bearer`
  en cada request subsiguiente.
- **Endpoints que usa Nexo (lista incompleta):**
  - `Estudiante/perfil` — perfil del alumno.
  - `Estudiante/horario` — horario del periodo activo.
  - `Estudiante/notas` — notas y promedios.
  - `Estudiante/cuotas` — cuotas pendientes (versión SIGMA).
  - `Estudiante/Publicaciones` — anuncios institucionales.
  - `Acceso/cambiarPassword` — cambio de contraseña.
  - Etc.

Son **exactamente** los mismos endpoints que llama el sitio web
oficial. Podés verlos en las DevTools (`F12 → Network`) cuando navegás
SIGMA con tu navegador.

### 2. Intranet (datos complementarios)

SIGMA no expone todo lo que el alumno puede ver. La **Intranet**
(`intranet.upla.edu.pe`) usa otro sistema (PHP clásico con cookies de
sesión) y tiene endpoints complementarios:

- Pagos detallados (`consultarPensiones`, `consultartotalPensiones`).
- Cronograma de cuotas del periodo (`obtenerCronograma`).
- Ranking promocional (`repRankingPromocionalEst`).
- Malla curricular (`repMallaCurricularEst`).
- Horario detallado por matrícula (`verhorariomatriz-matriculadosEstudiante`).

Nexo loguea contra Intranet con las mismas credenciales que SIGMA,
guarda el cookie `PHPSESSID` localmente y lo reusa hasta que expira.

### 3. Microsoft Teams (opcional)

Si querés ver tus clases y tareas de Teams dentro de Nexo, activás la
integración Microsoft 365:

1. **Login:** OAuth2 **Device Code Flow** contra
   `https://login.microsoftonline.com/organizations/oauth2/v2.0/`.
2. **API:** Microsoft Graph Education
   (`https://graph.microsoft.com/v1.0/education/...`).
3. **Permisos solicitados:** `EduRoster.ReadBasic`,
   `EduAssignments.ReadBasic`, `User.Read`, `openid`, `profile`,
   `offline_access`.

Los tokens (access + refresh) se guardan localmente como JSON. Se
refrescan automáticamente cuando vencen.

> Esta integración **es opcional** y completamente independiente del
> resto de Nexo. Si nunca la activás, jamás se hace una llamada a
> Microsoft.

## Patrón "híbrido" (Resolver)

Algunos datos están en SIGMA Y en Intranet (a veces con formatos
distintos, a veces solo en uno). Nexo implementa un patrón **Resolver**:
para cada dato, define una cadena de fuentes y elige la primera que
responda con data válida (con timeouts cortos).

Beneficio: si SIGMA está caído (cosa que pasa), Intranet sigue
funcionando para los datos que tiene, y Nexo no se rompe del todo.

## Estado en runtime — el AppStore

Toda la data se carga en un **AppStore** in-memory (patrón
`ChangeNotifier` de Flutter, con un wrapper `AsyncValue<T>` para
manejar estados `idle/loading/data/error`).

Las pantallas escuchan al store con `ListenableBuilder` y se
re-renderean cuando llega data nueva. Es básicamente Redux/MobX pero
sin librería extra — 1 archivo, ~600 líneas.

## Persistencia local

| Dato | Dónde vive | Cuándo se borra |
|------|-----------|----------------|
| Token SIGMA | SharedPreferences | Logout o desinstalar |
| Cookie Intranet | SharedPreferences | Logout o desinstalar |
| Tokens Microsoft | SharedPreferences (JSON) | Revocar acceso o desinstalar |
| Credenciales (si "Recordarme") | SharedPreferences (base64) | Desmarcar "Recordarme" o desinstalar |
| Perfil / horario / cuotas cacheados | SharedPreferences (JSON con TTL) | Logout o desinstalar |
| Listas grandes (histórico de pagos) | SQLite local (`sqflite`) | Logout o desinstalar |
| Snapshot de notas (para detectar cambios) | SharedPreferences | Logout o desinstalar |
| Tema, idioma, formato de hora | SharedPreferences | Desinstalar |
| Modelo Lumen (~290 MB o ~530 MB) | `getApplicationSupportDirectory()` | Borrar desde settings de Lumen o desinstalar |
| Historial de chat Lumen | Solo memoria (no persistido en v1) | Cerrar la app |

Todo lo que vive en `SharedPreferences` y `getApplicationSupportDirectory()`
es **privado a la app** (Android sandbox) — otras apps no pueden leerlo
sin root.

## Seguridad de transporte

Nexo bundlea el [CA bundle de Mozilla](https://curl.se/ca/cacert.pem)
en `assets/certs/cacert.pem`. Esto resuelve un problema real visto en
producción: ciertos teléfonos Android (especialmente Xiaomi con MIUI
viejas, y algunos Samsung) tienen el almacén raíz desactualizado y/o
SIGMA omite a veces certificados intermedios, lo que causa
`CERTIFICATE_VERIFY_FAILED`.

El bundle se carga en un `SecurityContext` con `setTrustedCertificatesBytes`
y se usa en todos los clientes HTTP de la app. En Web no aplica (el
navegador valida).

## Notificaciones

Nexo usa `flutter_local_notifications` para programar avisos **del
sistema operativo**:

- Recordatorios de clases (15 min antes del inicio).
- Recordatorios de cuotas (1 día antes del vencimiento).
- Detección de cambio en notas (al refrescar).

**No usamos servicios push** (Firebase Cloud Messaging, APNs). Eso
sería contradictorio con el principio de "sin servidor propio" — un
servicio push requiere un backend que mande mensajes a Google/Apple.

Las notificaciones se reprograman cada vez que abrís la app y la data
se refresca. Si pasás semanas sin abrir Nexo, las notificaciones
viejas siguen disparándose hasta su fecha programada, pero no
aparecen las nuevas.

## Diferencias vs. el sitio web oficial

| Aspecto | Sitio web UPLA | Nexo |
|---------|---------------|------|
| Login | Cada sistema (SIGMA, Intranet) por separado | Single sign-on con tus credenciales SIGMA |
| Modo offline | No | Sí (datos cacheados) |
| Notificaciones | No | Sí (locales) |
| Mobile-first | Parcial | Sí |
| Lumen (asistente IA) | No | Sí (opcional, on-device) |
| Costo | Gratis | Gratis |
| Ad networks | No (al momento de escribir) | No, jamás |
| Telemetría / analytics | Probable (Google Analytics) | No |

## ¿Y si UPLA cambia su API?

Cosa que pasa de vez en cuando. La rotura típica:

1. UPLA actualiza un endpoint, cambia el formato JSON.
2. Esa sección de Nexo aparece en blanco o tira "error al cargar".
3. Tenés que esperar a que yo (o un contributor) publique una versión
   actualizada — generalmente entre horas y días según mi disponibilidad.

Si querés que esa actualización vaya rápido, abrí un issue con la
descripción del problema (qué endpoint, qué error, qué versión).
