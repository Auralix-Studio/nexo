# Nexo · UPLA

> Cliente multiplataforma no oficial para estudiantes y docentes de la
> **Universidad Peruana Los Andes** — reinventa la experiencia de SIGMA,
> Intranet y Microsoft Teams en una sola app.

[![Última versión](https://img.shields.io/github/v/release/Alexito-Hub/nexo-releases?label=app&color=2563eb)](https://github.com/Alexito-Hub/nexo-releases/releases/latest)
[![Modelos Lumen](https://img.shields.io/github/v/release/Alexito-Hub/nexo-releases?label=modelos%20lumen&filter=lumen-models-*&color=8b5cf6)](https://github.com/Alexito-Hub/nexo-releases/releases?q=lumen-models)
[![Privacidad](https://img.shields.io/badge/datos-100%25%20locales-10b981)](./PRIVACY.md)

Nexo es una herramienta personal mantenida por **Alessandro Villogas
Gaspar** (estudiante UPLA, código U01025B). No está afiliada ni
respaldada oficialmente por la Universidad Peruana Los Andes.

---

## ¿Qué es?

- **Nexo:** una app de Flutter (Android, iOS, Web, Windows, macOS, Linux)
  que consume las APIs públicas de SIGMA y la Intranet de UPLA para
  mostrarte horario, notas, cuotas, pagos, constancias, cronogramas y
  tus clases de Microsoft Teams — todo en un solo lugar, rápido y
  pensado para móvil.

- **Lumen:** asistente IA personal **dentro de Nexo**. Corre **100 %
  en tu teléfono** (sin enviar nada a internet) y responde preguntas
  sobre tu propia data (horario, cuotas, notas, perfil) o sobre la
  universidad en general (carreras, trámites, sedes).

Detalles completos en [`docs/about.md`](./docs/about.md).

---

## Descargas

| Plataforma | Archivo | Tamaño aprox. |
|------------|---------|---------------|
| **Android** (recomendado) | [`nexo-vX.Y.Z-arm64.apk`](https://github.com/Alexito-Hub/nexo-releases/releases/latest) | ~140 MB |
| **Windows** (portable) | [`nexo-vX.Y.Z-windows.zip`](https://github.com/Alexito-Hub/nexo-releases/releases/latest) | próximamente |
| **Web** | [demo en línea](https://nexo.upla.dev) | — |

> Los modelos de **Lumen** se descargan **solo si activás el asistente**
> dentro de la app, una sola vez. Están publicados como release
> separado: ver [Modelos Lumen](https://github.com/Alexito-Hub/nexo-releases/releases?q=lumen-models).

Guía paso a paso en [`docs/install.md`](./docs/install.md).

---

## Privacidad — lo esencial

Nexo fue diseñado con la premisa de que **tu data académica es tuya**.

- Tu sesión, tus datos cacheados y tu chat con Lumen **viven solo en
  tu dispositivo**.
- Lumen procesa todo localmente — el modelo IA corre en tu CPU/GPU.
- Nexo no envía telemetría, no usa analytics, no perfila usuarios.
- El código de comunicación con UPLA es auditable (las requests son
  las mismas que hace tu navegador en SIGMA/Intranet).

Política completa en [`PRIVACY.md`](./PRIVACY.md).

---

## Cómo funciona (resumen)

Nexo no scrapeа HTML. Llama directamente a los endpoints **JSON** que
usan las propias apps oficiales de UPLA:

1. **SIGMA** (`sigma.upla.edu.pe`) — login con tu usuario y contraseña,
   devuelve un JWT que Nexo guarda en el dispositivo.
2. **Intranet** (`intranet.upla.edu.pe`) — login PHP por cookies para
   datos complementarios (pagos detallados, malla, ranking).
3. **Microsoft Graph Education** — OAuth2 Device Code Flow para
   integrar tus clases y tareas de Teams.

Arquitectura en [`docs/architecture.md`](./docs/architecture.md).

---

## FAQ corta

**¿Es seguro meter mi contraseña?**
Sí. Tu contraseña se usa solo contra los servidores oficiales de UPLA
(SIGMA / Intranet) y se guarda localmente cifrada en SharedPreferences
del SO. Nadie más la ve. [Ver detalle.](./docs/faq.md#contraseña)

**¿Por qué no está en Play Store / App Store?**
Por ahora es un proyecto personal y la inclusión en stores requiere
costos y trámites que no justifican el alcance actual. La distribución
es por sideload de APK firmado.

**¿Lumen consume mis datos móviles cuando le pregunto?**
No. Después de la descarga inicial del modelo (única vez), cero red.

[FAQ completa.](./docs/faq.md)

---

## Reportar un problema

Si algo no anda, abrí un issue en este repo:

<https://github.com/Alexito-Hub/nexo-releases/issues/new>

Incluí: pasos para reproducir, captura si aplica, modelo de teléfono y
versión de Nexo (visible en **Perfil → Acerca de Nexo**).

---

## Licencia

- **Documentación** en este repo: [CC BY 4.0](./LICENSE).
- **APKs y modelos** distribuidos en los releases: uso personal /
  educativo permitido. Ver [LICENSE](./LICENSE).
- **Código fuente**: privado (no publicado en este repo).
- **Modelos Lumen**: derivan de modelos de terceros sujetos a sus
  propias licencias. Ver [`docs/lumen.md`](./docs/lumen.md#licencia-del-modelo).
