# Lumen — asistente de IA on-device

## Descripción

Lumen es el asistente de inteligencia artificial integrado en Nexo.
Permite al usuario realizar consultas en lenguaje natural y obtener
respuestas elaboradas a partir de dos fuentes:

1. **Datos del usuario disponibles localmente.** Perfil, horario,
   cuotas y calificaciones que Nexo ya ha obtenido de SIGMA o de la
   Intranet UPLA.
2. **Base de conocimiento estática.** Información pública sobre la
   universidad (carreras, sedes, trámites, asignaturas) distribuida
   con la aplicación.

Toda la inferencia se ejecuta en el procesador del dispositivo. No se
realizan solicitudes a servicios de IA externos durante el uso del
asistente.

## Funcionamiento interno

El procesamiento de una consulta sigue las siguientes etapas:

1. **Clasificación de intención.** Un componente de routing aplica un
   conjunto de expresiones regulares a la consulta del usuario para
   identificar las categorías de información relevantes (horario,
   pagos, calificaciones, carreras, trámites, información general
   sobre UPLA, información sobre la aplicación).
2. **Construcción del prompt.** El módulo de contexto incorpora
   únicamente los bloques de información identificados como
   relevantes, junto con la consulta del usuario y la identificación
   del asistente. Este enfoque selectivo evita saturar el contexto del
   modelo y mantiene el rendimiento.
3. **Inferencia.** El motor invoca MediaPipe LLM Inference, que
   ejecuta el modelo sobre la CPU o GPU del dispositivo y emite la
   respuesta token a token.
4. **Visualización.** La interfaz del chat muestra los tokens conforme
   se generan, produciendo el efecto de escritura progresiva.
5. **Reinicio de contexto.** Tras la respuesta, el motor reinicia el
   contexto del modelo. Cada consulta es independiente de la anterior
   en esta versión del producto.

## Variantes disponibles

### Lumen Ligero (Gemma 3 — 270M, cuantización int8)

- Tamaño de descarga: ~290 MB.
- Consumo de memoria en ejecución: ~500 MB.
- Velocidad de generación: 30-50 tokens por segundo en dispositivos
  de gama media.
- Recomendado para dispositivos con 2-3 GB de RAM.

Modelo de tamaño reducido, optimizado para tiempos de respuesta
breves. Adecuado para consultas directas sobre los datos del usuario.

### Lumen Estándar (Gemma 3 — 1B, cuantización int4 QAT)

- Tamaño de descarga: ~530 MB.
- Consumo de memoria en ejecución: ~800 MB.
- Velocidad de generación: 15-25 tokens por segundo en dispositivos
  modernos.
- Recomendado para dispositivos con 4 GB de RAM o superior.

Modelo de mayor capacidad, ofrece respuestas más elaboradas y mejor
comprensión de consultas complejas.

La selección entre variantes se realiza desde Lumen → Configuración →
"Cambiar modelo". La operación elimina la variante actual y descarga
la nueva.

## Capacidades

El asistente está diseñado para responder a consultas como:

- "¿Cuál es mi próxima clase?"
- "¿Cuánto debo este mes?"
- "¿Cuál es mi promedio?"
- "¿Cómo trámito una constancia de matrícula?"
- "¿Qué carreras tiene la facultad de Ingeniería?"
- "¿En qué sede está la biblioteca principal?"

También admite conversación casual ("hola", "gracias") y preguntas
sobre el propio asistente o sobre Nexo.

## Limitaciones

- **No accede a internet** durante la inferencia.
- **No modifica información** en SIGMA ni en otros sistemas. Es un
  agente de solo lectura.
- **No envía mensajes** a profesores ni a terceros.
- **No conserva el historial de la conversación entre consultas** en
  esta versión. La persistencia se contempla para la versión 1.3.
- **No sustituye a la asesoría académica oficial.** Para trámites de
  importancia el usuario debe verificar la información en las fuentes
  institucionales.
- **No tiene la capacidad de razonamiento de los modelos comerciales
  en la nube.** Los modelos utilizados son significativamente más
  pequeños (270 millones a 1.000 millones de parámetros, frente a las
  decenas de miles de millones de los servicios comerciales).

## Comportamiento ante información ausente

Si el contexto inyectado no contiene la información necesaria para
responder con precisión a la consulta, el asistente está instruido
para indicarlo explícitamente en lugar de generar contenido inferido.
Este comportamiento es intencional: se prioriza la admisión de
desconocimiento sobre la generación de información incorrecta.

Si una categoría de consultas presenta este síntoma con frecuencia,
es posible que el routing requiera la incorporación de palabras clave
adicionales o que la base de conocimiento deba ampliarse.

## Privacidad — detalles técnicos

La afirmación de que Lumen opera "completamente en el dispositivo" se
sustenta en los siguientes hechos verificables:

1. El archivo del modelo (`.task` o `.litertlm` según plataforma) se
   descarga una única vez desde un release público de GitHub. Esta es
   la única solicitud de red que origina el módulo Lumen.
2. La inferencia se ejecuta mediante MediaPipe LLM Inference, una
   biblioteca C++ desarrollada por Google que opera sobre TensorFlow
   Lite. Ambas son bibliotecas locales estándar.
3. La consulta del usuario y la respuesta generada residen
   exclusivamente en la memoria del proceso y se descartan al
   finalizar el chat.

El código del módulo Lumen (`lib/ai/`) puede revisarse bajo acuerdo de
confidencialidad para verificar estas afirmaciones de forma
independiente.

## Licencia del modelo

Los archivos de modelo distribuidos por este proyecto son versiones
cuantizadas oficiales de Google, redistribuidas conforme a los
términos de la [Gemma Use Policy](https://ai.google.dev/gemma/terms).

Implicaciones para el usuario final:

- Uso personal y educativo permitido.
- Prohibido el uso para generar contenido dañino, ilegal o que viole
  los términos completos publicados por Google.
- En caso de redistribución por parte del usuario, deben mantenerse
  los términos de licencia originales.

El modelo se entrenó con datos cuyo corte de conocimiento es
principios de 2025. Eventos posteriores a esa fecha no forman parte
del conocimiento del modelo.

## Identificación del asistente

Al ser consultado sobre su naturaleza técnica, el asistente responde
identificándose como "Lumen, el asistente local de Nexo" sin
referenciar el modelo subyacente. Esta decisión obedece a tres
razones:

1. El producto se denomina Lumen, no Gemma.
2. La identidad del modelo es un detalle de implementación. Lo
   relevante para el usuario es el comportamiento (velocidad,
   privacidad, utilidad).
3. La posibilidad de cambiar el modelo subyacente en versiones
   futuras (a una variante mejor de Gemma o a un modelo alternativo)
   no debe afectar a la identidad del producto.

La información técnica completa sobre el modelo utilizado se publica
en este documento y en el código fuente. No se oculta ninguna
información de carácter técnico.

## Hoja de ruta

| Versión | Funcionalidad prevista |
|---------|------------------------|
| 1.3 | Persistencia del historial de conversaciones en SQLite local |
| 1.4 | Entrada de voz (reconocimiento) y salida de voz (síntesis) |
| 1.5 | Soporte multimodal (procesamiento de imágenes) |
| 2.0 | Modelos optimizados por SoC (Qualcomm NPU, MediaTek APU) |

## Comparación con servicios comerciales

| Aspecto | Lumen | ChatGPT (web) | Gemini app |
|---------|-------|---------------|------------|
| Procesamiento | Local | Servidores de OpenAI | Servidores de Google |
| Conexión requerida | Solo para descarga inicial | Permanente | Permanente |
| Coste | Gratuito, sin límite | Gratuito limitado / suscripción | Gratuito limitado / suscripción |
| Calidad | Adecuada para consultas directas | Muy alta | Muy alta |
| Acceso a datos del usuario | Sí (locales) | No | No |
| Funcionamiento sin conexión | Sí, tras descarga | No | No |

## Casos en que conviene no usar Lumen

- Cuando se requiere precisión absoluta sobre un valor monetario,
  fecha oficial o número administrativo. En estos casos la consulta
  directa a la pantalla correspondiente de Nexo ofrece el dato exacto
  proveniente de la API oficial.
- Para tareas que requieren razonamiento profundo o creatividad
  extensa. Los servicios comerciales en la nube son significativamente
  más capaces para este tipo de tareas.
- En dispositivos con menos de 3 GB de RAM. El rendimiento del modelo
  más pequeño puede no ser satisfactorio. En este caso es preferible
  desactivar Lumen y utilizar Nexo sin el asistente.
