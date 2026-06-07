# Registro de cambios

Historial de versiones publicadas de Nexo. Las versiones más recientes
se presentan en primer lugar. El formato se basa en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y la
numeración sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [Próximamente — 1.0.0]

Primera versión pública con el asistente Lumen integrado.

### Funcionalidades nuevas

- **Lumen**, asistente de inteligencia artificial on-device:
  - Dos variantes seleccionables durante la activación: Lumen Ligero
    (~290 MB) y Lumen Estándar (~530 MB).
  - Botón flotante de acceso con animación de entrada y comportamiento
    adaptativo al desplazamiento de la pantalla.
  - Pantalla de chat con generación de respuesta en streaming.
  - Sistema de clasificación de intención y selección dinámica del
    contexto a inyectar (horario, pagos, calificaciones, base de
    conocimiento UPLA).
  - Pantalla de configuración dedicada accesible desde el chat:
    cambio de variante, limpieza del historial y eliminación del
    modelo.
  - Inferencia completamente local. Ninguna solicitud a servicios de
    IA externos durante el uso.
- Integración con Microsoft Teams mediante OAuth2 Device Code Flow.
- Soporte multiplataforma para Android, iOS, Web, Windows, macOS y
  Linux.

### Cambios técnicos

- Refactorización del dominio: modelos unificados (`Student`,
  `Payment`, `ScheduleClass`, entre otros).
- Implementación del patrón Resolver para fallback automático entre
  SIGMA e Intranet.
- Persistencia de la sesión de Intranet en `SharedPreferences`.
- Actualización del `minSdk` de Android de 21 a 24, requisito de
  MediaPipe LLM Inference.

### Privacidad

- Sin telemetría. Sin servicios de análisis. Sin infraestructura
  propia operada por el responsable del proyecto.
- Documentación completa en [`PRIVACY.md`](./PRIVACY.md).
