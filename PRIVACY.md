# Política de privacidad — Nexo y Lumen

**Última actualización:** 2026-06-07
**Responsable:** Alessandro Villogas Gaspar (alumno UPLA, U01025B)
**Contacto:** [issues del repo](https://github.com/Alexito-Hub/nexo-releases/issues)

Este documento describe **qué datos toca Nexo**, **qué hace con ellos**
y **qué NO hace** — en lenguaje directo, sin legalese innecesario.

---

## TL;DR

- Nexo es **100 % cliente**: habla solo con los servidores oficiales
  de UPLA y de Microsoft (si activás Teams). No tiene servidor propio.
- **Lumen es 100 % on-device**: toda inferencia IA ocurre en tu
  teléfono. Cero llamadas a APIs externas.
- **Sin telemetría, sin analytics, sin tracking de uso.** Nexo no
  reporta nada de lo que hacés en la app.
- Tu sesión, datos cacheados e historial de chat **viven en tu
  dispositivo** y se borran al desinstalar.

---

## 1. Qué datos toca Nexo

### 1.1 Credenciales

Para iniciar sesión necesitás tu **usuario y contraseña de SIGMA UPLA**
(los mismos que usás en https://sigma.upla.edu.pe).

**Qué hacemos con ellas:**
- Las enviamos al endpoint oficial de login de SIGMA
  (`POST https://sigma.upla.edu.pe/api/...`) — la misma request que
  hace tu navegador cuando entrás al sitio web.
- Recibimos un **JWT** (token de sesión) y lo guardamos localmente.
- Si elegís "Recordarme", también guardamos tu usuario y contraseña
  cifradas en base64 en `SharedPreferences` (almacenamiento privado de
  la app, no accesible a otras apps en Android moderno).

**Qué NO hacemos:**
- No mandamos tu contraseña a ningún servidor que no sea SIGMA.
- No la transmitimos en texto plano (TLS de SIGMA con root CAs
  verificadas — Nexo incluye su propio bundle de Mozilla para evitar
  fallar en teléfonos con almacén raíz desactualizado).
- No la compartimos con terceros (porque no existe ningún tercero).

### 1.2 Datos académicos

Cuando la sesión está activa, Nexo consulta SIGMA e Intranet para
mostrarte:

- **Perfil:** nombre, código, carrera, facultad, ciclo, modalidad,
  sede, créditos aprobados.
- **Horario:** cursos del periodo activo (con docente, aula, día,
  hora).
- **Notas:** promedio acumulado, promedios por periodo, notas por
  curso, ranking promocional, conteo de notas pendientes.
- **Pagos:** cuotas pendientes y vencidas, histórico de operaciones,
  tasas/tarifas, cronograma del periodo.
- **Trámites:** constancias de matrícula generadas.

Toda esta data viaja por HTTPS entre tu teléfono y los servidores de
UPLA. Nexo cachea localmente lo más reciente para que la app sea rápida
y siga funcionando sin internet (modo offline básico). La caché vive en:

- `SharedPreferences` para metadata pequeña.
- SQLite local (`sqflite`) para listas más grandes.
- Ambos privados a la app, se borran al desinstalar o al usar
  "Cerrar sesión + limpiar".

### 1.3 Microsoft Teams (opcional)

Si activás la integración Teams, Nexo usa **OAuth2 Device Code Flow**
contra Microsoft Graph. El flujo:

1. La app pide un código a Microsoft.
2. Vos abrís https://microsoft.com/devicelogin y lo confirmás con tu
   cuenta institucional.
3. Microsoft devuelve a Nexo un access token + refresh token, que se
   guardan localmente.

**Permisos solicitados** (mínimos posibles):

- `EduRoster.ReadBasic` — leer la lista de tus clases de Teams.
- `EduAssignments.ReadBasic` — leer tus tareas.
- `User.Read` — leer tu nombre y email institucional.
- `openid`, `profile`, `offline_access` — estándar OAuth.

Podés revocar el acceso desde https://myaccount.microsoft.com cuando
quieras. Eso invalida los tokens guardados en Nexo.

### 1.4 Notificaciones locales

Nexo programa notificaciones **en el sistema operativo** para:
- Recordatorios de clases (15 min antes del inicio).
- Recordatorios de cuotas (1 día antes del vencimiento).
- Cambios en notas (cuando detecta una nueva al refrescar).

Estas notificaciones son **locales** — el SO las dispara desde el
mismo dispositivo. No usamos servicios push (ni Firebase, ni APNs).

---

## 2. Lumen (asistente IA on-device)

Lumen es opcional. Si lo activás, descargás **una sola vez** un modelo
de lenguaje (~290 MB o ~530 MB según la variante que elijas) desde un
release de GitHub.

**Qué hace Lumen con tu data:**

- Lee la data que ya tenés en Nexo (perfil, horario, cuotas, notas)
  desde el almacén local — la misma que ves en pantalla.
- Construye un prompt en memoria con esa info y se lo pasa al modelo.
- El modelo corre **en el procesador de tu teléfono** vía MediaPipe
  LLM Inference (capa C++ encima de TensorFlow Lite).
- La respuesta se streamea palabra por palabra a la UI del chat.

**Qué NO hace Lumen:**

- No envía tu pregunta a ningún servidor.
- No envía tu data académica fuera del dispositivo.
- No registra ni reporta nada de lo que le preguntás.
- No usa APIs de OpenAI, Google AI, Anthropic, ni ninguna otra
  IA en la nube.

**Auditable:** el módulo `lib/ai/` del código fuente puede ser
revisado bajo NDA si querés verificar que cumple esto.

Más detalles en [`docs/lumen.md`](./docs/lumen.md).

---

## 3. Qué Nexo NO hace

Esta lista es importante. **Nada de lo siguiente ocurre** en Nexo:

- **Telemetría**: no medimos sesiones, no mandamos heartbeats, no
  trackeamos crashes en servicios tipo Sentry/Firebase Crashlytics.
- **Analytics**: no usamos Google Analytics, ni Mixpanel, ni nada
  parecido. Literalmente no sabemos cuándo abrís la app.
- **Publicidad**: no hay anuncios, no hay SDKs de ad networks.
- **Compartir con terceros**: no hay terceros — Nexo es un cliente
  directo a UPLA + Microsoft.
- **Procesamiento en la nube**: no tenemos servidor de Nexo. Todo
  lo que ves se calcula en tu teléfono.
- **Venta de datos**: nadie nos puede comprar lo que no tenemos.

---

## 4. Tus controles

Vos podés en cualquier momento:

- **Cerrar sesión** (Perfil → Cerrar sesión) — limpia el token y el
  caché. Las credenciales recordadas se borran si lo desactivás antes.
- **Desactivar Lumen** (FAB Lumen →  → Borrar modelo) — libera el
  espacio del modelo y deshabilita el asistente.
- **Limpiar historial de Lumen** (FAB Lumen →  → Limpiar historial)
  — borra el chat actual.
- **Revocar Teams** (https://myaccount.microsoft.com) — invalida el
  acceso de Nexo a Microsoft Graph.
- **Desinstalar Nexo** — Android/iOS borran todos los datos privados
  de la app automáticamente.

---

## 5. Seguridad

- Toda comunicación con SIGMA, Intranet y Microsoft Graph usa **TLS**
  (HTTPS).
- Nexo incluye el bundle de CA roots de Mozilla
  (`assets/certs/cacert.pem`) para arreglar el handshake TLS en
  dispositivos con almacén de certificados desactualizado.
- Las credenciales guardadas localmente se ofuscan en base64. **No es
  cifrado fuerte** — si alguien tiene acceso root al teléfono, las
  puede leer. Es el mismo nivel de seguridad que la mayoría de apps
  móviles.
- Para datos sensibles a nivel "secret manager", considerá no marcar
  "Recordarme" y reintroducir credenciales cada vez.

---

## 6. Menores de edad

Nexo está diseñado para estudiantes universitarios mayores de 16 años
(la mayoría legal de edad en Perú es 18). Si sos menor, idealmente
pediles a tus padres o tutores que revisen esta política antes de usar
la app.

---

## 7. Cambios en esta política

Si esta política cambia (por ejemplo, agregamos una integración nueva),
vas a ver:

1. La nueva versión publicada en este repo (`PRIVACY.md`).
2. Una nota en el `CHANGELOG.md` indicando que la política cambió.
3. **No te obligamos a aceptar nada** — si los cambios no te gustan,
   podés desinstalar la app.

---

## 8. Limitaciones de responsabilidad

Nexo es un proyecto personal, mantenido **as-is**. Aunque hago todo lo
razonablemente posible para que sea seguro y funcione bien:

- No garantizo disponibilidad 24/7.
- No garantizo que los datos que ves sean siempre los mismos que ves
  en SIGMA (latencia, cache, errores transitorios de UPLA pueden
  hacer que difieran).
- Para trámites legales o decisiones críticas (matrícula, sustentación,
  etc), **confirmá siempre con la fuente oficial**.

---

## 9. Preguntas o reclamos

Abrí un issue en
<https://github.com/Alexito-Hub/nexo-releases/issues> con tu pregunta.
Si preferís privado, escribí "PRIVATE" en el título y solo el mantenedor
verá el contenido.
