# Arquitectura

Este documento describe la arquitectura de comunicación de Nexo con los
sistemas institucionales y la organización del estado y la persistencia
en el dispositivo del usuario. El nivel de detalle es suficiente para
auditoría de privacidad sin requerir acceso al código fuente.

## Visión general

```
┌──────────────────┐         HTTPS         ┌─────────────────────┐
│                  │  ──────────────────►  │  sigma.upla.edu.pe  │
│   Dispositivo    │  Acceso/Login (JWT)   │  (autenticación +   │
│   del usuario    │  Estudiante/*         │   datos académicos) │
│                  │                       └─────────────────────┘
│  ┌────────────┐  │
│  │ AppStore   │  │         HTTPS         ┌─────────────────────┐
│  │ (memoria)  │  │  ──────────────────►  │ intranet.upla.edu.pe│
│  └────┬───────┘  │  Cookie PHPSESSID     │  (datos complemen-  │
│       │          │                       │   tarios)           │
│  ┌────▼───────┐  │                       └─────────────────────┘
│  │ Persisten- │  │
│  │ cia local  │  │         HTTPS         ┌─────────────────────┐
│  │ (SQLite +  │  │  ──────────────────►  │ login.microsoft     │
│  │ SharedPref)│  │  OAuth2 Device Code   │ online.com +        │
│  └────────────┘  │  (opcional)           │ graph.microsoft.com │
│                  │                       └─────────────────────┘
│  ┌────────────┐  │
│  │   Lumen    │  │  No se realizan solicitudes adicionales:
│  │ (modelo IA │  │  ningún servidor propio, ninguna telemetría,
│  │  local)    │  │  ninguna API de IA externa.
│  └────────────┘  │
└──────────────────┘
```

## Integraciones

### 1. SIGMA

- **URL base:** `https://sigma.upla.edu.pe/api`
- **Autenticación:** JWT. La aplicación envía las credenciales del
  usuario al endpoint `Acceso/Login`, recibe un token y lo conserva en
  `SharedPreferences`. Cada solicitud posterior incluye la cabecera
  `Authorization: Bearer <token>`.
- **Endpoints utilizados** (listado representativo, no exhaustivo):
  - `Estudiante/perfil` — datos personales y académicos.
  - `Estudiante/horario` — horario del periodo activo.
  - `Estudiante/notas` — calificaciones y promedios.
  - `Estudiante/cuotas` — cuotas pendientes.
  - `Estudiante/Publicaciones` — anuncios institucionales.
  - `Acceso/cambiarPassword` — modificación de contraseña.

Los endpoints utilizados son los mismos que invoca el portal web
oficial de SIGMA. Pueden inspeccionarse mediante las herramientas de
desarrollo del navegador.

### 2. Intranet UPLA

La Intranet (`intranet.upla.edu.pe`) expone información complementaria
no disponible en SIGMA, a través de un sistema basado en cookies de
sesión PHP:

- `consultarPensiones` y `consultartotalPensiones` — detalle de pagos.
- `obtenerCronograma` — cronograma de cuotas del periodo.
- `repRankingPromocionalEst` — ranking promocional.
- `repMallaCurricularEst` — malla curricular.
- `verhorariomatriz-matriculadosEstudiante` — horario detallado.

Nexo autentica contra la Intranet utilizando las mismas credenciales
de SIGMA, conserva la cookie `PHPSESSID` localmente y la reutiliza
hasta su caducidad.

### 3. Microsoft Graph Education (opcional)

Cuando el usuario activa la integración con Microsoft Teams:

1. **Autenticación:** OAuth2 Device Code Flow contra
   `https://login.microsoftonline.com/organizations/oauth2/v2.0/`.
2. **API:** Microsoft Graph Education
   (`https://graph.microsoft.com/v1.0/education/...`).
3. **Permisos delegados solicitados:** `EduRoster.ReadBasic`,
   `EduAssignments.ReadBasic`, `User.Read`, `openid`, `profile` y
   `offline_access`.

Los tokens (access y refresh) se almacenan localmente en formato JSON
y se renuevan automáticamente cuando caducan.

Esta integración es independiente del resto de la aplicación. Sin
activación explícita, Nexo no realiza ninguna solicitud a servicios
de Microsoft.

## Patrón Resolver

Determinados datos están disponibles en SIGMA y en la Intranet UPLA,
en ocasiones con formatos distintos o únicamente en uno de los dos
sistemas. Nexo implementa un patrón Resolver: para cada dato se
declara una cadena de fuentes y se selecciona la primera que responda
con información válida, aplicando tiempos de espera reducidos.

Esto permite que la aplicación siga ofreciendo funcionalidad cuando
uno de los sistemas presenta indisponibilidad temporal.

## Gestión de estado

La aplicación mantiene el estado de la sesión en una instancia de
`AppStore` (clase basada en `ChangeNotifier` de Flutter, con un
contenedor `AsyncValue<T>` para representar los estados `idle`,
`loading`, `data` y `error`).

Las pantallas observan al store mediante `ListenableBuilder` y se
redibujan automáticamente cuando los datos cambian.

## Persistencia local

| Dato | Ubicación | Eliminación |
|------|-----------|-------------|
| Token SIGMA | `SharedPreferences` | Cierre de sesión o desinstalación |
| Cookie Intranet | `SharedPreferences` | Cierre de sesión o desinstalación |
| Tokens Microsoft | `SharedPreferences` (JSON) | Revocación de acceso o desinstalación |
| Credenciales (con opción "Recordar") | `SharedPreferences` (Base64) | Desactivación de la opción o desinstalación |
| Perfil, horario y cuotas (caché) | `SharedPreferences` (JSON con TTL) | Cierre de sesión o desinstalación |
| Histórico de pagos | SQLite local (`sqflite`) | Cierre de sesión o desinstalación |
| Snapshot de calificaciones | `SharedPreferences` | Cierre de sesión o desinstalación |
| Preferencias (tema, idioma) | `SharedPreferences` | Desinstalación |
| Modelo Lumen (290–530 MB) | `getApplicationSupportDirectory()` | Configuración de Lumen → "Borrar modelo" o desinstalación |
| Historial de conversaciones de Lumen | Memoria volátil | Cierre de la aplicación |

Toda la información persistida en `SharedPreferences` y en
`getApplicationSupportDirectory()` reside en el sandbox privado de la
aplicación. En Android moderno no es accesible a otras aplicaciones
sin acceso root.

## Seguridad del transporte

Nexo incluye el [almacén de autoridades certificadoras de
Mozilla](https://curl.se/ca/cacert.pem) en
`assets/certs/cacert.pem`. Este recurso aborda un problema observado
en producción: determinados dispositivos Android, especialmente
modelos Xiaomi con versiones antiguas de MIUI y algunos Samsung,
presentan un almacén raíz desactualizado o reciben certificados
intermedios incompletos por parte de SIGMA, lo que provoca el error
`CERTIFICATE_VERIFY_FAILED`.

El almacén se carga en un `SecurityContext` mediante
`setTrustedCertificatesBytes` y se utiliza en todos los clientes HTTP
de la aplicación. La versión web delega esta validación al navegador.

## Notificaciones

Nexo utiliza `flutter_local_notifications` para programar avisos
locales del sistema operativo:

- Recordatorios de clases (quince minutos antes del inicio).
- Avisos de vencimiento de cuotas (un día antes de la fecha límite).
- Detección de calificaciones nuevas al actualizar el registro.

La aplicación no utiliza servicios de notificaciones push (Firebase
Cloud Messaging, Apple Push Notification Service ni equivalentes).
Esta decisión es coherente con el principio de no operar
infraestructura propia: un servicio push requeriría un backend que
emita los mensajes a través de los proveedores de cada plataforma.

Las notificaciones se reprograman al iniciar la aplicación. Los
avisos cuya fecha programada se cumpla siguen disparándose aunque la
aplicación no haya sido abierta recientemente, pero no se generan
avisos nuevos hasta que el usuario abra la aplicación y se
actualicen los datos.

## Comparativa con el portal web oficial

| Aspecto | Portal web UPLA | Nexo |
|---------|----------------|------|
| Autenticación | Independiente por sistema (SIGMA, Intranet) | Inicio de sesión unificado con credenciales SIGMA |
| Modo sin conexión | No disponible | Disponible (datos en caché) |
| Notificaciones | No disponibles | Disponibles (locales) |
| Diseño móvil | Parcial | Optimizado |
| Asistente integrado | No disponible | Opcional, ejecución local |
| Costo | Gratuito | Gratuito |
| Publicidad | No | No |
| Telemetría / análisis | Probable | No |

## Mantenimiento ante cambios en APIs de UPLA

Las APIs institucionales pueden modificarse sin previo aviso. Un
cambio en el formato de respuesta de un endpoint puede causar que la
sección correspondiente de Nexo presente errores o aparezca vacía. La
resolución requiere la publicación de una versión actualizada de la
aplicación. Los reportes de incidencias mediante issues aceleran este
proceso.
