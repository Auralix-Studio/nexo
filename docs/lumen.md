# Lumen — el asistente IA on-device de Nexo

## Qué es Lumen

Lumen es un **chat con un modelo de lenguaje pequeño** que vive dentro
de Nexo. Le hacés preguntas en español; te responde usando:

1. **Tu data en vivo** (perfil, horario, cuotas, notas) que Nexo ya
   tiene cargada del SIGMA / Intranet.
2. **Un knowledge base estático** sobre UPLA (carreras, sedes,
   trámites, asignaturas) que viene bundleado en la app.

Todo procesado **en tu propio teléfono**. Sin servidor, sin APIs de IA
externas, sin internet en el momento de inferencia.

## Cómo funciona (paso a paso)

Cuando le hacés una pregunta:

1. **Router de intent** clasifica tu pregunta con regex livianos:
   - "¿cuándo es mi próxima clase?" → categoría `schedule`.
   - "¿cuánto debo?" → categoría `payments`.
   - "¿qué carreras hay?" → categoría `careersKb`.
   - "hola" → ninguna categoría especial.
2. **Context builder** arma un prompt en memoria, incluyendo solo los
   bloques que el router flageó (para no saturar el modelo).
3. **Engine** (capa sobre MediaPipe LLM Inference) toma ese prompt y
   genera la respuesta token por token usando la CPU/GPU del
   dispositivo.
4. La UI del chat va mostrando cada token apenas llega — el efecto
   "máquina de escribir" que ves.
5. Cuando termina, el chat se resetea internamente. La próxima
   pregunta es independiente (no recuerda la anterior — diseño de v1).

## Las dos variantes

Cuando activás Lumen por primera vez, te deja elegir:

### Lumen Ligero (~290 MB)

- Modelo base: ~270M parámetros, cuantización int8.
- RAM en runtime: ~500 MB.
- Velocidad: 30-50 tokens/segundo en teléfonos de gama media.
- **Recomendado para:** teléfonos con 2-3 GB de RAM o gama media-baja.
- **Limitación honesta:** modelo pequeño = respuestas más cortitas y
  ocasionalmente menos precisas. Aún así sirve para Q&A directo
  sobre tu data.

### Lumen Estándar (~530 MB)

- Modelo base: ~1B parámetros, cuantización int4 (QAT).
- RAM en runtime: ~800 MB.
- Velocidad: 15-25 tokens/segundo en teléfonos modernos.
- **Recomendado para:** teléfonos con 4 GB de RAM o más.
- **Mejor calidad** general — entiende mejor preguntas elaboradas y
  da respuestas más completas.

Podés cambiar entre variantes en cualquier momento desde el ícono de
ajustes de Lumen → "Cambiar modelo". Se borra la actual y se descarga
la nueva.

## Qué puede y qué no puede

### Puede

- "¿Cuál es mi próxima clase?" (lee tu horario)
- "¿Cuánto debo este mes?" (lee tus cuotas)
- "¿Cuál es mi promedio?" (lee tus notas)
- "¿Cómo trámito una constancia de matrícula?" (responde desde el KB)
- "¿Qué carreras tiene la facultad de Ingeniería?" (idem)
- "¿En qué sede está la biblioteca principal?" (idem)
- Conversación casual ("hola", "gracias", "qué podés hacer").

### No puede

- **Navegar internet** — el modelo es local, sin acceso a la red.
- **Modificar datos en SIGMA** — Lumen es solo lectura.
- **Contactar a profesores ni a otras personas** — no manda mensajes.
- **Recordar conversaciones pasadas** — en v1 cada pregunta es
  independiente (lo cambiaremos en v1.3).
- **Reemplazar a asesoría académica oficial** — para trámites
  importantes confirmá con la fuente.
- **Razonar como GPT-4** — son modelos pequeñísimos en comparación.
  No le pidas que te ayude con tu tesis ni que escriba código complejo.

## Por qué a veces dice "no tengo esa información"

Si la data que necesita la respuesta **no está en el contexto que el
router le inyectó**, Lumen prefiere decir "no sé" antes que inventar.
Es comportamiento intencional — preferimos respuestas vacías a
respuestas falsas.

Si pasa frecuentemente con un tipo de pregunta, abrí un issue
indicando el ejemplo. Probablemente hay que mejorar el router (agregar
más palabras clave para esa categoría) o el knowledge base (agregar la
info que falta).

## Privacidad — la versión técnica

Por qué decimos "100 % on-device":

1. El modelo `.task` se descarga **una vez** desde un release público
   de este repo (binario estático, sin telemetría).
2. La descarga es la **única** llamada de red que hace el módulo de
   Lumen. Después de eso, el módulo no abre sockets a internet.
3. La inferencia ocurre vía **MediaPipe LLM Inference** (librería C++
   de Google) sobre **TensorFlow Lite**. Estas son librerías locales
   estándar — corren en el procesador del teléfono.
4. El input (tu prompt) y el output (la respuesta) viven solo en RAM
   y se descartan al cerrar el chat.

**Auditoría:** el código del módulo Lumen (`lib/ai/`) puede ser
revisado bajo NDA si querés verificar la afirmación. Las únicas
llamadas HTTP en ese módulo son a `github.com/Alexito-Hub/nexo-releases`
para descargar el `.task` inicial.

## Licencia del modelo

Los modelos `.task` que distribuimos son **versiones cuantizadas
oficiales de Google**, redistribuidas según los términos de la
**[Gemma Use Policy](https://ai.google.dev/gemma/terms)**.

Esto significa que:
- Podés usarlos para fines personales y educativos.
- No podés usarlos para generar contenido dañino, ilegal, etc.
- Si los redistribuís a tu vez, debés mantener el aviso de licencia.

El modelo en sí fue entrenado por Google con un cutoff de conocimiento
de **principios de 2025**. Eventos posteriores los desconoce.

## Por qué Lumen no menciona qué modelo usa

Si le preguntás "¿qué modelo sos?", Lumen responde algo como *"soy
Lumen, el asistente local de Nexo"* y no menciona Gemma ni Google.

Esto no es por ocultar nada — es producto de:
- El nombre del producto es **Lumen**, no "Gemma".
- Al usuario final le importa el comportamiento (rápido, privado,
  útil), no el nombre del modelo subyacente.
- Si en futuras versiones cambiamos el modelo subyacente (ej. una
  variante mejor de Gemma, o Qwen, o Phi), el nombre "Lumen" sigue
  siendo el mismo y no rompemos esa abstracción.

La info técnica completa (qué modelo, qué cuantización, qué tamaño)
está en este documento y en el código fuente. Cero ocultación.

## Roadmap de Lumen

- **v1.3:** persistencia del chat en SQLite — Lumen recordará
  conversaciones pasadas.
- **v1.4:** voz (input por micrófono + TTS para las respuestas).
- **v1.5:** multimodal — mandar fotos al chat (ej.: foto de tu
  boleta de pago para que te diga qué es cada línea).
- **v2.0:** modelos optimizados por SoC (Snapdragon NPU, MediaTek
  APU) para 3-5x más velocidad.

## Comparativa rápida

|  | Lumen | ChatGPT (web) | Gemini app |
|---|-------|--------------|------------|
| Privacidad | 100 % local | Tu prompt va a OpenAI | Tu prompt va a Google |
| Internet requerido | Solo para descarga inicial | Sí, cada vez | Sí, cada vez |
| Costo | Gratis, sin límite de uso | Free tier con límites + suscripción | Idem |
| Calidad | Buena para Q&A simple | Excelente | Excelente |
| Conoce tu data UPLA | Sí (porque Nexo se la pasa) | No | No |
| Funciona offline | Sí, tras descarga | No | No |

## Cuándo NO usar Lumen

- Si necesitás precisión absoluta sobre un monto, fecha o número
  oficial → mirá la pantalla correspondiente en Nexo (Pagos, Notas,
  Horario) directamente. Esos datos vienen de la API oficial,
  exactos. Lumen los lee de ahí pero puede formatearlos mal en
  rarísimos casos.
- Para preguntas complejas que requieran razonamiento profundo →
  ChatGPT / Gemini Pro / Claude son mucho más capaces. Lumen es un
  ayudante de bolsillo, no un tutor.
- Si tu teléfono es muy viejo (<3 GB RAM) → el modelo más chico puede
  no correr fluido. En ese caso, mejor desactivá Lumen y usá Nexo
  normal.
