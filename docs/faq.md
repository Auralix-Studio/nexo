# Preguntas frecuentes

## Sobre Nexo

### ¿La aplicación es oficial de UPLA?

No. Nexo es un proyecto independiente desarrollado por Alessandro
Villogas Gaspar, estudiante de la universidad (código U01025B). No
cuenta con patrocinio, supervisión ni reconocimiento institucional
por parte de la Universidad Peruana Los Andes.

### ¿Es seguro introducir mi contraseña en la aplicación? <a name="contrasena"></a>

Las credenciales del usuario se utilizan exclusivamente para
autenticarse contra los servidores oficiales de SIGMA y de la
Intranet UPLA, mediante conexiones TLS (HTTPS). Estas son las mismas
solicitudes que realiza el portal web institucional.

Si el usuario activa la opción "Recordar credenciales", éstas se
almacenan en el área privada de la aplicación, codificadas en Base64.
Este nivel de protección es equivalente al utilizado por la mayoría
de aplicaciones móviles.

Las credenciales no se transmiten a ningún servicio adicional, dado
que el proyecto no opera servidores propios.

Para una seguridad superior, el usuario puede mantener desactivada la
opción "Recordar" y reintroducir las credenciales en cada inicio de
sesión.

### ¿La aplicación tiene algún costo?

Nexo es gratuita. No incluye publicidad, compras integradas ni
suscripciones.

### ¿Cómo se sostiene económicamente el proyecto?

No existe un modelo de negocio. El proyecto se desarrolla y mantiene
sin financiación, en horas fuera del horario académico del
mantenedor. Las contribuciones de la comunidad (reporte de errores,
sugerencias de funcionalidad, difusión entre otros estudiantes) son
la principal forma de apoyo.

### ¿Está disponible para iPhone?

La aplicación compila para iOS, pero no se distribuye oficialmente en
App Store debido al costo del programa Apple Developer. Para
instalación local, consultar la documentación de
[instalación](./install.md#ios).

### ¿Funciona sin conexión a internet?

Parcialmente. La carga inicial requiere conectividad para autenticar
y obtener los datos del usuario. Posteriormente, los datos
almacenados en caché permanecen accesibles sin conexión. Las
operaciones que requieren información actualizada (refrescar
calificaciones, generar una constancia nueva) sí requieren conexión.

El asistente Lumen funciona sin conexión tras la descarga inicial del
modelo.

### ¿Qué ocurre si UPLA modifica sus APIs?

Cuando los endpoints utilizados por la aplicación cambian, las
secciones afectadas pueden presentar errores hasta que se publique
una versión actualizada de Nexo. La resolución de estos incidentes
depende del reporte oportuno por parte de los usuarios mediante
issues en el repositorio.

### ¿Por qué la aplicación ocupa tanto espacio?

El APK para arquitecturas modernas pesa aproximadamente 160 MB. La
mayor parte del tamaño corresponde a las bibliotecas nativas C++
requeridas por el módulo Lumen (MediaPipe y TensorFlow Lite). El
código de la aplicación propiamente dicha representa una fracción
menor del tamaño total. Si el módulo Lumen no se activa, estas
bibliotecas siguen presentes pero no se cargan en memoria.

---

## Sobre Lumen

### ¿Lumen tiene acceso a mis datos académicos?

Sí, dentro del dispositivo. Lumen consulta los mismos datos que la
aplicación ya tiene almacenados localmente (perfil, horario, cuotas,
calificaciones) para responder a las consultas del usuario. Esta
información no abandona el dispositivo.

### ¿Es posible usar Nexo sin activar Lumen?

Sí. Lumen es completamente opcional. La descarga del modelo solo
ocurre cuando el usuario activa explícitamente el asistente. Si nunca
se interactúa con el botón flotante de Lumen, la aplicación funciona
como un cliente UPLA sin componente de IA.

### ¿Cuánto espacio requiere el modelo?

- Lumen Ligero: aproximadamente 290 MB.
- Lumen Estándar: aproximadamente 530 MB.

La descarga es única y solo se repite si el usuario cambia de
variante.

### ¿Por qué Lumen no recuerda las consultas anteriores?

En la versión 1.0, cada consulta se procesa de forma independiente
para evitar interferencias entre temas y para garantizar que el
contexto enviado al modelo sea siempre el adecuado para la pregunta
formulada. La persistencia del historial está prevista para la
versión 1.3.

### Las respuestas de Lumen son incorrectas o el asistente no responde

Los modelos pequeños tienen limitaciones inherentes. Se recomienda:

1. Reformular la consulta con términos más específicos. Por ejemplo,
   "¿cuál es mi próxima clase?" en lugar de "¿qué tengo ahora?".
2. Probar con la otra variante: si se está utilizando Lumen Ligero,
   cambiar a Lumen Estándar puede mejorar la calidad.
3. Limpiar el historial mediante el botón de actualización en la
   parte superior del chat.

Si el problema persiste con consultas frecuentes, reportarlo mediante
un issue en el repositorio.

### ¿Es posible entrenar Lumen con datos personalizados?

No con la versión actual. Lumen utiliza un modelo pre-entrenado al
que se le inyectan los datos del usuario en tiempo de ejecución. El
ajuste fino del modelo (fine-tuning) requeriría infraestructura no
disponible en el contexto del proyecto.

### ¿Lumen consume mucha batería?

El consumo es elevado durante la generación de una respuesta
(aproximadamente 5-15 segundos de uso intensivo de procesador). Dado
que esto solo ocurre al consultar al asistente, el impacto diario es
moderado: entre 1% y 3% adicional de batería para un uso típico de
varias consultas al día.

### ¿En qué dispositivos Android funciona?

- Android 7.0 (API 24) o superior.
- 3 GB de RAM como mínimo recomendado.
- Procesador ARM64 (presente en la mayoría de dispositivos desde
  2016).

En dispositivos que no cumplan estos requisitos, Nexo puede
utilizarse sin activar Lumen.

---

## Privacidad

### ¿Se recopilan estadísticas de uso?

No. La aplicación no implementa telemetría ni análisis de uso.

### ¿Se almacenan registros (logs) en algún sistema externo?

No. La aplicación genera registros para depuración local, accesibles
mediante herramientas del sistema operativo (`adb logcat` en
Android). Estos registros no se transmiten a ningún destino externo.

### ¿Microsoft o Google tienen acceso a mis datos académicos?

- **Google:** únicamente conoce que se descargó el modelo Lumen
  desde un release de GitHub (cuya CDN utiliza Microsoft Azure). No
  recibe información posterior sobre el uso de la aplicación.
- **Microsoft:** solo si se activa la integración con Teams.
  En ese caso, el usuario otorga permisos explícitos para que la
  aplicación lea su lista de clases y tareas mediante Microsoft
  Graph. No existe intercambio de información entre Microsoft y SIGMA.

### ¿Qué ocurre si pierdo el dispositivo?

La sesión almacenada permanece en el dispositivo. Si un tercero
accede al equipo desbloqueado, podría visualizar los datos
mostrados por Nexo. Como medida de mitigación, se recomienda cambiar
la contraseña de SIGMA desde otro dispositivo. Esto invalida el
token almacenado y la siguiente sesión automática en el dispositivo
perdido fallará.

### ¿Puedo exportar mis datos?

Sí. Desde la sección Perfil pueden generarse PDFs de la constancia
de matrícula y del cronograma de pagos. La exportación completa en
formato JSON está prevista para una versión futura.

---

## Trámites y datos académicos

### ¿Las calificaciones mostradas son las oficiales?

Sí. Provienen directamente de SIGMA. Ante discrepancias con el
portal web, la solución habitual es actualizar la información
mediante el gesto pull-to-refresh. Las divergencias persistentes
deben reportarse como issue.

### ¿Puedo pagar las cuotas desde la aplicación?

No. Nexo es una aplicación de solo lectura. El pago debe realizarse
por los canales oficiales: portal de pagos UPLA, banca electrónica o
ventanilla bancaria.

### ¿Puedo matricularme desde la aplicación?

No. El proceso de matrícula se realiza exclusivamente desde el
portal SIGMA web. Nexo no automatiza trámites administrativos.

### ¿Por qué algunas calificaciones no aparecen?

Las causas habituales son:

- La calificación aún no ha sido publicada por el docente.
- La información pertenece a una vista heredada del sistema que la
  API moderna no expone. Estos casos pueden reportarse como issue
  para evaluar su integración.

---

## Desarrollo y contribuciones

### ¿El código fuente está disponible?

La documentación publicada en este repositorio (`nexo-releases`) se
distribuye bajo licencia CC BY 4.0. El código fuente de la
aplicación no es público en esta fase del proyecto. Las
contribuciones bajo acuerdo de confidencialidad pueden coordinarse
mediante issue.

### ¿Por qué el código no es de fuente abierta?

La decisión actual responde a tres consideraciones:

1. La base de código contiene configuraciones específicas que
   requerirían sanitización previa a su publicación.
2. La apertura del código facilitaría la distribución de versiones
   modificadas con propósitos no autorizados, en perjuicio de la
   confianza de los usuarios.
3. La apertura del código se contempla para fases más maduras del
   proyecto.

### ¿Cómo reporto un error?

Mediante el sistema de issues del repositorio público:

<https://github.com/auralix-studio/nexo/issues>

Información útil para acelerar la resolución:

- Pasos para reproducir el problema.
- Captura de pantalla cuando corresponda.
- Modelo del dispositivo y versión del sistema operativo.
- Versión de Nexo (visible en Perfil → Acerca de Nexo).

### ¿Puedo proponer nuevas funcionalidades?

Sí, mediante issues. Las propuestas se evalúan según su alineación
con los principios del proyecto y la disponibilidad de tiempo del
mantenedor.
