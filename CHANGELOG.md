# Changelog

Todas las versiones publicadas de Nexo. Las más recientes arriba.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

---

## [Próximamente — 1.0.0]

Primera versión pública con Lumen integrado.

### Agregado
- **Lumen**, asistente IA on-device:
  - Dos variantes: **Lumen Ligero** (~290 MB) y **Lumen Estándar**
    (~530 MB). Selección durante onboarding.
  - FAB flotante con animación de "ola" + hide/show por scroll.
  - Pantalla de chat con streaming token a token.
  - Router de intent + inyección selectiva de contexto (horario,
    cuotas, notas, KB de UPLA).
  - Settings dedicada accesible desde el ícono de ajustes del chat
    (cambiar modelo, limpiar historial, borrar modelo).
  - 100 % on-device — cero llamadas a APIs externas en runtime.
- Integración Microsoft Teams (OAuth2 Device Code).
- Soporte multiplataforma: Android, iOS, Web, Windows, macOS, Linux.

### Cambios
- Refactor del dominio: modelos unificados (`Student`, `Payment`,
  `ScheduleClass`, etc).
- Patrón Resolver para fallback entre fuentes (SIGMA ↔ Intranet).
- Persistencia de sesión Intranet (cookies en SharedPreferences).
- Bumpeo `minSdk` Android: 21 → 24 (requisito MediaPipe).

### Privacidad
- Sin telemetría. Sin analytics. Sin servidor de Nexo.
- Documentación completa en [`PRIVACY.md`](./PRIVACY.md).

---

## Notas sobre la numeración

Versiones siguen [Semantic Versioning](https://semver.org/lang/es/):
- **MAJOR** (1.x.x): rompe compatibilidad — ej. cambio de modelo
  Lumen que invalida descargas previas.
- **MINOR** (x.1.x): features nuevas, backward-compatible.
- **PATCH** (x.x.1): bug fixes únicamente.
