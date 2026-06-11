# Política de Privacidad

**Versión:** 1.0
**Vigente desde:** 7 de junio de 2026
**Responsable del tratamiento:** Alessandro Villogas Gaspar
**Contacto:** [GitHub Issues](https://github.com/auralix-studio/nexo/issues)

Este documento describe el tratamiento que la aplicación Nexo
(en adelante, "la Aplicación") realiza sobre los datos del usuario.
Se redacta en lenguaje directo a fin de garantizar su comprensión por
parte de personas no técnicas.

---

## 1. Principios

La Aplicación se diseñó conforme a los siguientes principios:

1. **Cliente directo.** La Aplicación se comunica exclusivamente con
   los servidores oficiales de la Universidad Peruana Los Andes y, de
   forma opcional, con Microsoft Graph. No existe un servidor
   intermedio operado por el responsable.
2. **Procesamiento local.** Toda la información del usuario se
   almacena y procesa en el dispositivo. El asistente Lumen ejecuta su
   inferencia íntegramente en el procesador del equipo.
3. **Ausencia de telemetría.** La Aplicación no recopila estadísticas
   de uso, eventos de interfaz ni métricas de rendimiento.
4. **Reversibilidad.** Toda la información almacenada por la
   Aplicación puede eliminarse mediante los controles previstos al
   efecto o desinstalando el programa.

---

## 2. Datos tratados

### 2.1. Credenciales de acceso a SIGMA

El usuario debe introducir su nombre de usuario y contraseña de SIGMA
UPLA para utilizar las funciones que dependen de dicha plataforma.

- Las credenciales se transmiten exclusivamente al endpoint oficial de
  autenticación de SIGMA (`https://sigma.upla.edu.pe/api/Acceso/...`)
  mediante TLS.
- Si el usuario activa la opción "Recordar credenciales", éstas se
  almacenan localmente en el área privada de la aplicación
  (`SharedPreferences` de Android, equivalente en iOS), codificadas en
  Base64 a efectos de ofuscación.
- Las credenciales no se transmiten a ningún servicio adicional ni a
  terceros.

### 2.2. Datos académicos y administrativos

Mientras la sesión está activa, la Aplicación consulta los siguientes
datos a través de las APIs oficiales de UPLA:

- **Perfil del estudiante:** nombre completo, código, carrera,
  facultad, ciclo, modalidad, sede, créditos aprobados.
- **Horario académico:** asignaturas, docentes, aulas, horarios y
  modalidad del periodo activo.
- **Calificaciones:** promedio acumulado, promedios por periodo, notas
  por asignatura y ranking promocional.
- **Información financiera:** cuotas pendientes y vencidas, histórico
  de operaciones, cronograma de pagos del periodo.
- **Trámites:** constancias generadas, certificados, etc.

Esta información se almacena en caché en el dispositivo
(`SharedPreferences` para metadatos y SQLite local para listas
extensas) con el fin de habilitar el modo sin conexión y acelerar la
carga de pantallas. La caché se elimina al cerrar sesión o desinstalar
la Aplicación.

### 2.3. Integración con Microsoft 365 (opcional)

Cuando el usuario activa la integración con Microsoft Teams:

- La Aplicación inicia un flujo OAuth2 Device Code Flow contra
  `login.microsoftonline.com`.
- Se solicitan permisos delegados mínimos: `EduRoster.ReadBasic`,
  `EduAssignments.ReadBasic`, `User.Read`, `openid`, `profile` y
  `offline_access`.
- Los tokens (access y refresh) se almacenan localmente como JSON.
- El usuario puede revocar el acceso en cualquier momento desde
  <https://myaccount.microsoft.com>.

### 2.4. Notificaciones locales

La Aplicación programa notificaciones a través del sistema operativo
para los siguientes eventos:

- Recordatorios de clases (quince minutos antes del inicio).
- Avisos de vencimiento de cuotas (un día antes de la fecha límite).
- Detección de calificaciones nuevas (al actualizar el registro).

Las notificaciones se generan localmente. La Aplicación no utiliza
servicios de notificaciones push (Firebase Cloud Messaging, Apple Push
Notification Service ni equivalentes).

---

## 3. Asistente Lumen

Lumen es un módulo opcional. Su activación requiere la descarga única
de un modelo de lenguaje (entre 290 MB y 530 MB según la variante
elegida) desde un release público de GitHub.

### 3.1. Funcionamiento

- El modelo se ejecuta en el procesador del dispositivo mediante
  MediaPipe LLM Inference.
- Lumen accede únicamente a la información ya disponible en la
  Aplicación: perfil, horario, cuotas y notas.
- El usuario formula una consulta. El sistema construye en memoria un
  prompt que incluye únicamente los datos relevantes para esa
  consulta, lo envía al motor de inferencia local y muestra la
  respuesta en pantalla.

### 3.2. Lo que Lumen no hace

- No transmite la consulta del usuario a ningún servidor externo.
- No comparte datos académicos fuera del dispositivo.
- No registra ni reporta las interacciones del usuario.
- No utiliza APIs de OpenAI, Google AI, Anthropic ni otros
  proveedores en la nube.

La única solicitud de red que origina el módulo Lumen es la descarga
inicial del modelo desde la URL pública del release. Detalles técnicos
en [`docs/lumen.md`](./docs/lumen.md).

---

## 4. Prácticas no realizadas

A fin de evitar ambigüedad, la Aplicación no realiza ninguna de las
siguientes prácticas:

- Recopilación de métricas de uso ni telemetría.
- Integración con servicios de análisis (Google Analytics, Firebase
  Analytics, Mixpanel u otros).
- Inclusión de publicidad o SDKs de monetización.
- Compartición de datos con terceros.
- Procesamiento en servidores propios.
- Comercialización de información del usuario.

---

## 5. Derechos del usuario

El usuario puede ejercer en todo momento los siguientes controles:

- **Cerrar sesión** (Perfil → Cerrar sesión): elimina el token de
  acceso y la caché. Las credenciales recordadas se eliminan si la
  opción "Recordar" se desactiva previamente.
- **Desactivar Lumen** (Lumen → Configuración → Borrar modelo): elimina
  el modelo descargado y libera el almacenamiento ocupado.
- **Limpiar historial de Lumen** (Lumen → Configuración → Limpiar
  historial): elimina la conversación actual.
- **Revocar el acceso de Microsoft 365** (<https://myaccount.microsoft.com>):
  invalida los tokens almacenados.
- **Desinstalar la Aplicación**: el sistema operativo elimina la
  totalidad de los datos privados de la Aplicación.

---

## 6. Medidas de seguridad

- Toda la comunicación con SIGMA, Intranet UPLA y Microsoft Graph
  utiliza TLS (HTTPS).
- La Aplicación incluye el almacén de autoridades certificadoras de
  Mozilla (`assets/certs/cacert.pem`) y lo carga en un
  `SecurityContext` propio para mitigar fallos de validación TLS en
  dispositivos cuyo almacén raíz se encuentre desactualizado.
- Las credenciales almacenadas localmente se codifican en Base64.
  Esta medida ofusca el valor pero no constituye cifrado robusto. Los
  usuarios que requieran un nivel de seguridad superior deberían
  abstenerse de utilizar la opción "Recordar credenciales".

---

## 7. Menores de edad

La Aplicación se dirige a estudiantes universitarios. Se recomienda
que los usuarios menores de edad consulten esta política con sus
padres o tutores antes de utilizar el servicio.

---

## 8. Modificaciones de esta política

Cualquier modificación sustancial de esta política se reflejará en:

1. La publicación de una nueva versión de este documento en el
   repositorio público.
2. Una entrada en el [`CHANGELOG.md`](./CHANGELOG.md) que indique el
   cambio.

El usuario no está obligado a aceptar modificaciones futuras y puede
desinstalar la Aplicación en cualquier momento.

---

## 9. Limitación de responsabilidad

La Aplicación se distribuye sin garantías expresas ni implícitas. El
responsable no se hace cargo de:

- Pérdida o corrupción de datos.
- Decisiones académicas, administrativas o financieras tomadas con
  base en información mostrada por la Aplicación.
- Interrupciones del servicio derivadas de fallos en los sistemas de
  UPLA o de Microsoft.
- Modificaciones de las políticas o APIs de terceros que afecten al
  correcto funcionamiento de la Aplicación.

Para trámites legales, académicos o financieros, el usuario debe
verificar la información en las fuentes oficiales.

---

## 10. Contacto

Las consultas, reclamaciones o solicitudes relativas a esta política
pueden remitirse mediante un issue en el repositorio público:

<https://github.com/auralix-studio/nexo/issues>

Para asuntos que requieran reserva, se ruega indicar la palabra
`PRIVADO` en el título del issue.
