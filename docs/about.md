# Acerca de Nexo y Lumen

## Origen del proyecto

Nexo nace de una observación práctica sobre la experiencia de los
estudiantes de la Universidad Peruana Los Andes con sus sistemas
académicos digitales:

- Las interfaces web de SIGMA y de la Intranet UPLA fueron diseñadas
  para uso en computadoras de escritorio y no se adaptan
  adecuadamente a dispositivos móviles.
- Los servicios académicos y administrativos están repartidos entre
  dos sistemas (SIGMA e Intranet) que utilizan las mismas credenciales
  pero requieren autenticación independiente.
- No existen notificaciones nativas para eventos relevantes como el
  vencimiento de cuotas, la publicación de calificaciones o los
  cambios de aula.
- La integración con Microsoft Teams, plataforma utilizada por UPLA
  para el dictado virtual, no está disponible desde un único punto.
- Los documentos académicos (constancia de matrícula, cronograma de
  pagos) requieren navegación adicional para generarse.

Nexo se concibe como un cliente alternativo, orientado a dispositivos
móviles, que centraliza estas funcionalidades en una sola aplicación.

## Denominación

El nombre "Nexo" refleja la función de la aplicación: actuar como
nexo entre el usuario y los distintos sistemas digitales de la
universidad. Constituye un único punto de acceso para SIGMA,
Intranet y Microsoft Teams.

## El asistente Lumen

Lumen, del latín *lumen* ("luz"), es el asistente de inteligencia
artificial integrado en Nexo. Su propósito es responder en lenguaje
natural a las consultas frecuentes que un estudiante formula a lo
largo de su vida académica:

- ¿Cuándo es la próxima clase y en qué aula?
- ¿Cuál es el monto adeudado en el mes en curso?
- ¿Cuál es la fecha de vencimiento de la siguiente cuota?
- ¿Qué carreras se imparten en una determinada facultad?
- ¿Cuál es el procedimiento para tramitar una constancia?

Lumen formula la respuesta a partir de dos fuentes:

1. **Datos del usuario almacenados localmente** (perfil, horario,
   cuotas, calificaciones) que Nexo ya obtuvo de SIGMA o de la
   Intranet UPLA.
2. **Base de conocimiento estática** sobre la universidad (carreras,
   sedes, trámites, asignaturas) distribuida con la aplicación.

La inferencia se ejecuta íntegramente en el procesador del
dispositivo. No se establece comunicación con servicios externos
durante el uso del asistente.

### Decisión técnica: ejecución local

La elección de un modelo on-device, frente a una integración con
servicios remotos como ChatGPT o Gemini API, responde a tres
criterios:

1. **Privacidad verificable.** La afirmación "los datos del usuario no
   abandonan el dispositivo" es comprobable mediante inspección del
   tráfico de red, no requiere confianza en un proveedor.
2. **Sostenibilidad operativa.** Los servicios de IA en la nube
   facturan por uso. Mantener un asistente para una población
   estudiantil amplia exigiría una vía de monetización (suscripciones,
   publicidad, recopilación de datos) incompatible con los principios
   del proyecto.
3. **Funcionamiento sin conexión.** Tras la descarga inicial del
   modelo, el asistente opera sin necesidad de conectividad,
   característica relevante en entornos con cobertura intermitente.

El compromiso aceptado es que el modelo utilizado (entre 270 millones
y 1.000 millones de parámetros) tiene una capacidad significativamente
inferior a la de los modelos comerciales de la nube
(decenas de miles de millones de parámetros). Esto se traduce en
respuestas más concisas, menor profundidad en razonamiento abstracto y
limitaciones para tareas creativas extensas. El asistente está
optimizado para consultas puntuales sobre los datos del usuario y la
información institucional, no como sustituto de tutoría académica.

Documentación técnica detallada en [`lumen.md`](./lumen.md).

## Principios técnicos

El desarrollo de Nexo se rige por los siguientes principios:

1. **Cliente puro.** El proyecto no opera servidores propios. La
   aplicación se comunica directamente con los servicios oficiales de
   UPLA y de Microsoft. Esta arquitectura elimina la dependencia de
   infraestructura mantenida por el responsable del proyecto.
2. **Auditabilidad.** Las solicitudes HTTP que realiza la aplicación
   son equivalentes a las observables en las herramientas de
   desarrollo de cualquier navegador al utilizar SIGMA o la Intranet.
3. **Ausencia de instrumentación.** No se recopila información
   estadística sobre el uso de la aplicación.
4. **Reversibilidad.** Toda la información almacenada por la
   aplicación puede eliminarse mediante los controles previstos o
   desinstalando el programa.
5. **Multi-plataforma.** La misma base de código produce binarios
   para Android, iOS, Windows, macOS, Linux y Web.

## Equipo y vinculación institucional

- **Mantenedor:** Alessandro Villogas Gaspar.
  Estudiante de Ingeniería de Sistemas y Computación. Código de
  matrícula U01025B. Sede Huancayo.
- **Modalidad:** desarrollo individual realizado fuera del horario
  académico, sin financiación.
- **Vinculación con UPLA:** ninguna de carácter oficial. El proyecto
  no cuenta con patrocinio ni reconocimiento institucional.

## Marco legal

Nexo opera dentro del marco legal de uso de los servicios web de UPLA:

- Consume las APIs públicas que sirven a los portales oficiales de la
  universidad.
- Requiere autenticación válida del usuario mediante credenciales
  SIGMA. No elude controles de acceso.
- No redistribuye contenido protegido por derechos de autor ni
  material académico institucional.
- No automatiza acciones que las APIs no permitan al usuario realizar
  de forma manual desde la web oficial.

En caso de que la universidad solicite el cese de operaciones del
proyecto, éste se discontinuará sin objeciones.

## Hoja de ruta

Líneas de trabajo previstas para versiones futuras:

- **Lumen multimodal** (v1.5+). Capacidad de procesar imágenes
  enviadas por el usuario (por ejemplo, fotografías de boletas).
- **Persistencia de conversaciones** (v1.3). Almacenamiento del
  historial de Lumen en SQLite local.
- **Funcionalidades para docentes.** Ampliación del modo docente
  actual con endpoints adicionales, condicionada a la disponibilidad
  de cuentas de prueba.
- **Distribución oficial para iOS.** Sujeta a la disponibilidad de los
  fondos necesarios para el programa Apple Developer.
- **Entrada por voz** (v2). Reconocimiento de voz para formular
  consultas a Lumen.

Las propuestas de funcionalidad pueden formularse mediante la apertura
de un issue en el repositorio público.
