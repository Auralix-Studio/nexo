# Instalación de Nexo

## Android

### Vía APK (recomendado por ahora)

1. Andá al [release más reciente](https://github.com/Alexito-Hub/nexo-releases/releases/latest).
2. Descargá el APK correspondiente a tu teléfono:
   - **`nexo-vX.Y.Z-arm64.apk`** — para la mayoría de teléfonos modernos
     (~140 MB).
   - **`nexo-vX.Y.Z-armv7.apk`** — para teléfonos antiguos de 32 bits.
   - **`nexo-vX.Y.Z-universal.apk`** — si no sabés cuál es tu
     arquitectura (~250 MB, pesa más pero anda en todo).
3. Abrilo desde el archivador del teléfono. Android te va a preguntar
   si permitís instalar apps de fuentes desconocidas:
   - Activá la opción "Permitir desde esta fuente" en Settings.
   - Volvé y dale "Instalar".
4. Abrí Nexo desde el cajón de apps.
5. **Aceptá términos** → **iniciá sesión** con tu cuenta de SIGMA UPLA.

### Permisos que pide

- **Notificaciones** — para recordatorios de clases y cuotas.
  Podés rechazar si no las querés.
- **Almacenamiento** (solo Android viejo, <10) — para exportar PDFs.
  En Android 10+ no se pide.
- **Micrófono** — solo si activás voz en Lumen (feature v1.4+).

### Permisos que NO pide

- Contactos.
- Cámara (salvo que actives multimodal Lumen, v1.5+).
- Ubicación.
- SMS.
- Historial de llamadas.

### Por qué no está en Play Store

El proceso de publicación en Play Store requiere:
- Pago anual al Developer Program.
- Trámites de cumplimiento (declaración de datos, edad, etc).
- Revisión que puede tardar y a veces objeta apps "no oficiales" de
  instituciones.

Hoy no justifica el costo para un proyecto personal. Si la app llega
a tener mucha tracción, lo reconsidero.

---

## iOS

Actualmente no distribuido oficialmente para iOS. La app compila y
corre — si querés instalarla en tu iPhone:

1. Necesitás Mac + Xcode.
2. Cloná el repo privado (acceso solo bajo NDA — escribime).
3. Build + sideload con tu Apple ID (Free Developer Account te da 7
   días de instalación antes de tener que renovar).

Plan para v2: ver si puedo costear el Apple Developer Program ($99/año)
y publicar en App Store.

---

## Windows (escritorio)

Próximamente como release oficial.

Por ahora la app funciona en Windows pero la distribuyo a pedido. Si
querés probarla en tu PC, abrí un issue con tu caso de uso y te paso
el binario.

---

## Web

Demo en vivo: <https://nexo.upla.dev> (si está caída, abrí un issue —
es un host gratuito que de vez en cuando se cae).

**Limitaciones de la versión web:**
- No hay notificaciones (los browsers de móvil las restringen).
- La integración Microsoft Teams requeriría CORS proxy → no funciona
  en web.
- Lumen funciona pero descarga el modelo cada vez que abrís una
  pestaña nueva (a menos que el browser haga caching).

---

## Activar Lumen (cualquier plataforma)

Una vez instalada Nexo:

1. Vas a ver el **botón flotante de Lumen** (logo destello) en la
   esquina inferior derecha de cualquier pantalla.
2. Tocalo → modal de bienvenida explicando privacidad + selector de
   modelo.
3. Elegí:
   - **Lumen Ligero** (~290 MB) — para teléfonos de gama media-baja.
   - **Lumen Estándar** (~530 MB) — para teléfonos modernos.
4. "Aceptar y descargar" → barra de progreso. Es **descarga única**,
   no se repite.
5. Cuando termine, podés empezar a chatear.

El modelo se guarda en almacenamiento privado de la app. Para
liberarlo: FAB Lumen →  Settings → "Borrar modelo".

Más sobre Lumen en [`lumen.md`](./lumen.md).

---

## Verificar integridad del APK

Cada release publica el **SHA-256** del APK en las release notes.
Para verificar:

```powershell
Get-FileHash -Algorithm SHA256 .\nexo-vX.Y.Z-arm64.apk
```

```bash
sha256sum nexo-vX.Y.Z-arm64.apk
```

Si el hash no coincide con el del release, **no instales el archivo**
— puede estar corrupto o manipulado. Abrí un issue.

---

## Desinstalar

### Android
Mantené presionado el ícono → "Desinstalar". Borra todos los datos
locales automáticamente.

### Para borrar solo el modelo Lumen sin desinstalar la app
FAB Lumen →  → "Borrar modelo".

### Para cerrar sesión sin perder configuración
Pestaña Perfil → "Cerrar sesión".
