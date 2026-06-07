# Sobre Nexo y Lumen

## Por qué existe Nexo

Como estudiante de Ingeniería de Sistemas en UPLA, usaba SIGMA y la
Intranet todos los días. Ambas funcionan, pero:

- La UX está pensada para escritorio, **no para móvil**.
- Hay que loguearse en dos sitios separados (SIGMA y Intranet) con
  la misma cuenta para ver toda tu info.
- No hay notificaciones de cosas críticas (próxima cuota a vencer,
  cambio de aula, nota nueva publicada).
- La integración con Microsoft Teams (que UPLA usa para clases) no
  está en ningún lado — hay que abrir Teams aparte.
- Los PDFs (constancia de matrícula, cronograma de pagos) requieren
  trámites o no se pueden generar en el momento.

**Nexo es la app que yo quería tener.** Es un cliente alternativo,
mobile-first, que centraliza todo eso. Lo hice para mí, y al ver que
funcionaba bien decidí compartirlo con otros estudiantes UPLA.

## Por qué se llama "Nexo"

Porque conecta — es el nexo entre vos y los sistemas dispersos de la
universidad. Un solo punto de entrada para SIGMA + Intranet + Teams.

## Por qué Lumen

**Lumen** ("luz" en latín) es el asistente IA que vive dentro de Nexo.

El problema original: incluso con Nexo centralizando todo, las preguntas
que el estudiante se hace todos los días siguen requiriendo navegar
pantallas:

> "¿Cuál es mi próxima clase? ¿En qué aula? ¿Cuánto debo este mes?
> ¿Cuándo vence mi cuota 3? ¿Qué carreras hay en Ingeniería?
> ¿Cómo trámito una constancia?"

Lumen responde estas preguntas en lenguaje natural usando tu propia
data + un knowledge base sobre UPLA. Y lo hace **sin enviar nada a
internet**: el modelo de IA corre en tu propio teléfono.

### Por qué on-device y no ChatGPT

Tres razones:

1. **Privacidad real, no prometida.** No es "no compartimos tu data" —
   es "tu data nunca sale del dispositivo, físicamente imposible que la
   veamos porque no tenemos servidor".
2. **Cero costo recurrente.** ChatGPT API cobra por token. Mantener un
   asistente con ~5000 estudiantes consultando varias veces por día
   sería caro y requeriría monetizar la app o pedir donaciones.
3. **Funciona sin internet.** Una vez descargado el modelo, podés
   consultar tu horario o cuotas estando en cualquier lado, sin datos
   móviles.

El trade-off es que el modelo es **chico** (270M o 1B parámetros vs
los ~70B de GPT-4) y por lo tanto:
- Responde más cortito y a veces más seco.
- No "razona" tan bien sobre temas complejos.
- Está pensado para Q&A sobre tu data + conocimiento UPLA básico, no
  para conversaciones largas o tareas creativas.

Detalles técnicos de Lumen en [`lumen.md`](./lumen.md).

## Filosofía técnica

Las reglas que sigo al desarrollar Nexo:

1. **Cliente puro.** No tengo servidor propio. Si UPLA cae, Nexo no
   puede hacer mucho — pero tampoco hay dependencia mía para que la
   app funcione si yo desaparezco.
2. **Audit-friendly.** Las requests que hace Nexo son las mismas que
   ves en las DevTools del navegador en SIGMA. No hay magia oscura.
3. **Sin trackers.** No mido nada de lo que hacés. Si necesito saber
   si una feature se usa, lo pregunto en público (issue/encuesta).
4. **Reversible.** Cualquier cosa que la app guarda se borra al
   desinstalar o al usar los controles correspondientes (cerrar sesión,
   borrar modelo Lumen, etc).
5. **Multi-plataforma.** Lo mismo que ves en Android lo ves en iOS,
   Web, Windows, macOS y Linux. Single codebase con Flutter.

## Quién lo hace

- **Mantenedor:** Alessandro Villogas Gaspar
  - Estudiante UPLA, Ingeniería de Sistemas y Computación, código
    U01025B.
  - Sede Huancayo.
- **Tiempo invertido:** proyecto personal, contribuciones en mis ratos
  libres.
- **Relación con UPLA:** ninguna oficial. Soy alumno como cualquier
  otro. La universidad no patrocina ni respalda este proyecto.

## Es legal lo que hago?

Sí. Nexo:
- Llama a las APIs públicas que ya usan los sitios oficiales de UPLA
  (las mismas que ves en las DevTools del navegador).
- No bypassea autenticación: para usar Nexo tenés que loguearte con tu
  cuenta SIGMA, igual que para entrar al sitio web.
- No scrape contenido protegido por copyright ni redistribuye material
  académico de la universidad.
- No automatiza acciones que las APIs no permitan al usuario hacer
  manualmente.

Si UPLA me pide que deje de operar Nexo (cosa que dudo, porque ayuda a
sus propios estudiantes), lo doy de baja sin drama.

## Roadmap (lo que viene)

Cosas en las que estoy trabajando o pensando:

- **Lumen multimodal** (v1.5+): mandar fotos al asistente (ej.: foto
  de tu boleta para que te diga qué es).
- **Persistencia de chat** (v1.3): historial de conversaciones con
  Lumen guardado en SQLite local.
- **Modo docente más completo**: hoy hay un esqueleto, pero le faltan
  endpoints (los que existen requieren cuenta de profesor para
  descubrirlos).
- **iOS oficial**: la app compila en iOS pero no la he distribuido por
  Apple por costos del Developer Program.
- **Voice input** para Lumen (v2): preguntar en voz alta.

Si querés que algo en particular suba en prioridad, abrí un issue.
