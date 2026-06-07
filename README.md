# Nexo

**Cliente multiplataforma no oficial para estudiantes y docentes de la
Universidad Peruana Los Andes.** Integra SIGMA, Intranet de pagos y
Microsoft Teams en una sola aplicación. Incluye **Lumen**, un asistente
de inteligencia artificial que opera íntegramente en el dispositivo.

[![Última versión](https://img.shields.io/github/v/release/Alexito-Hub/nexo-releases?label=app&color=2563eb)](https://github.com/Alexito-Hub/nexo-releases/releases/latest)
[![Modelos Lumen](https://img.shields.io/github/v/release/Alexito-Hub/nexo-releases?label=modelos%20lumen&filter=lumen-models-*&color=8b5cf6)](https://github.com/Alexito-Hub/nexo-releases/releases?q=lumen-models)
[![Privacidad](https://img.shields.io/badge/datos-100%25%20locales-10b981)](./PRIVACY.md)

> **Aviso.** Nexo es un proyecto independiente mantenido por Alessandro
> Villogas Gaspar (UPLA, código U01025B). No está afiliado ni respaldado
> oficialmente por la Universidad Peruana Los Andes.

---

## Descripción

Nexo es una aplicación construida sobre Flutter que ofrece una interfaz
unificada para los servicios académicos y administrativos que UPLA pone
a disposición de sus estudiantes y docentes. Las plataformas soportadas
son Android, iOS, Windows, macOS, Linux y Web.

La aplicación se comunica directamente con los endpoints oficiales de
SIGMA y de la Intranet UPLA — los mismos que utilizan los portales web
institucionales. No existen servidores intermediarios operados por
terceros: toda la información viaja entre el dispositivo del usuario y
los sistemas de la universidad.

**Lumen**, el asistente de IA integrado, ejecuta un modelo de lenguaje
de tamaño reducido (de la familia Gemma) directamente en el procesador
del dispositivo mediante MediaPipe LLM Inference. La inferencia es
local: ningún dato del usuario sale del equipo durante el uso del
asistente.

Documentación detallada en [`docs/about.md`](./docs/about.md).

---

## Descargas

| Plataforma | Archivo | Tamaño |
|------------|---------|--------|
| Android (arm64) | `nexo-vX.Y.Z-arm64.apk` | ~160 MB |
| Android (armv7) | `nexo-vX.Y.Z-armv7.apk` | ~27 MB |
| Android (universal) | `nexo-vX.Y.Z-universal.apk` | ~252 MB |
| Windows x64 | `nexo-vX.Y.Z-windows-x64.zip` | ~222 MB |

Descargas disponibles en [Releases](https://github.com/Alexito-Hub/nexo-releases/releases/latest).
Los modelos de Lumen se distribuyen como release independiente y la
aplicación los obtiene automáticamente cuando el usuario activa el
asistente.

Guía completa de instalación en [`docs/install.md`](./docs/install.md).

---

## Privacidad

Principios fundamentales del proyecto:

- **Procesamiento local.** Las sesiones, datos en caché y conversaciones
  con Lumen permanecen exclusivamente en el dispositivo del usuario.
- **Sin telemetría.** La aplicación no recopila métricas de uso ni envía
  información a sistemas de análisis.
- **Sin intermediarios.** Las solicitudes a SIGMA, Intranet y Microsoft
  Graph se realizan directamente desde el cliente, sin pasar por
  servidores propios.
- **Auditable.** El código de comunicación con UPLA replica las
  solicitudes documentadas en las herramientas de desarrollo del
  navegador al utilizar SIGMA o la Intranet.

Política de privacidad completa: [`PRIVACY.md`](./PRIVACY.md).

---

## Arquitectura

Nexo se integra con tres servicios:

1. **SIGMA** (`sigma.upla.edu.pe`) — autenticación principal mediante
   JWT y consulta de datos académicos.
2. **Intranet UPLA** (`intranet.upla.edu.pe`) — datos complementarios
   sobre pagos, malla curricular y ranking promocional.
3. **Microsoft Graph Education** — integración opcional con Teams
   mediante OAuth2 Device Code Flow.

Detalles técnicos en [`docs/architecture.md`](./docs/architecture.md).

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/about.md`](./docs/about.md) | Origen del proyecto, filosofía técnica y hoja de ruta. |
| [`docs/install.md`](./docs/install.md) | Procedimientos de instalación por plataforma. |
| [`docs/architecture.md`](./docs/architecture.md) | Diseño de la integración con UPLA. |
| [`docs/lumen.md`](./docs/lumen.md) | Funcionamiento técnico del asistente Lumen. |
| [`docs/faq.md`](./docs/faq.md) | Preguntas frecuentes. |
| [`docs/troubleshoot.md`](./docs/troubleshoot.md) | Diagnóstico de problemas comunes. |
| [`PRIVACY.md`](./PRIVACY.md) | Política de privacidad. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Historial de versiones publicadas. |

---

## Reportar problemas

Para informar de un defecto o proponer una mejora, abrir un issue en:

<https://github.com/Alexito-Hub/nexo-releases/issues>

Información útil al reportar:

- Pasos para reproducir el problema.
- Captura de pantalla cuando corresponda.
- Modelo del dispositivo y versión del sistema operativo.
- Versión de Nexo (visible en **Perfil → Acerca de Nexo**).

---

## Licencia

La documentación de este repositorio se publica bajo [Creative Commons
BY 4.0](./LICENSE). Los binarios distribuidos en los releases se
licencian para uso personal y educativo. Los modelos de Lumen están
sujetos a la [Gemma Use Policy](https://ai.google.dev/gemma/terms). El
código fuente de la aplicación es privado.

Texto completo en [`LICENSE`](./LICENSE).
