# Guía de instalación

## Android

### Instalación mediante APK

1. Acceder al [último release](https://github.com/auralix-studio/nexo/releases/latest).
2. Descargar el APK correspondiente al dispositivo:
   - `nexo-vX.Y.Z-arm64.apk` para la mayoría de dispositivos modernos
     (Android 8.0 o superior, ~160 MB).
   - `nexo-vX.Y.Z-armv7.apk` para dispositivos antiguos de 32 bits
     (~27 MB; el asistente Lumen no estará disponible en esta
     arquitectura).
   - `nexo-vX.Y.Z-universal.apk` cuando se desconoce la arquitectura
     del dispositivo (~252 MB; compatible con todas las plataformas
     ARM y x86_64).
3. Abrir el archivo desde el gestor de archivos del dispositivo.
   Android solicitará autorización para instalar aplicaciones de
   fuentes desconocidas:
   - Activar la opción "Permitir desde esta fuente" en Ajustes.
   - Regresar al instalador y confirmar la instalación.
4. Abrir Nexo desde el menú de aplicaciones.
5. Aceptar los términos y autenticarse con las credenciales de SIGMA
   UPLA.

### Permisos solicitados

| Permiso | Propósito | Obligatorio |
|---------|-----------|-------------|
| Notificaciones | Recordatorios de clases y vencimientos | No |
| Almacenamiento | Exportación de PDFs (solo Android 9 o anterior) | Condicional |
| Micrófono | Entrada de voz para Lumen (versión 1.4 o posterior) | No |

### Permisos no solicitados

La aplicación no solicita acceso a contactos, cámara (excepto cuando
se active la funcionalidad multimodal de Lumen en versiones
posteriores), ubicación, SMS ni historial de llamadas.

### Disponibilidad en Google Play Store

La publicación en Google Play Store requiere el pago de la cuota
anual del programa Google Play Developer y la superación de los
controles de cumplimiento de la tienda. Esta vía de distribución no
está prevista en la fase actual del proyecto. La distribución se
realiza mediante sideload de APK firmado.

---

## Windows

### Instalación del paquete

1. Descargar `nexo-vX.Y.Z-windows-x64.zip` del [último release](https://github.com/auralix-studio/nexo/releases/latest).
2. Extraer el contenido del archivo en una carpeta temporal.
3. Ejecutar `nexo.exe` desde la carpeta extraída.
4. En el primer arranque, la aplicación presenta un asistente con dos
   opciones:
   - **Instalar.** Nexo se copia a `%LOCALAPPDATA%\Nexo`, crea
     accesos directos en el escritorio y el menú Inicio según la
     selección del usuario, y se registra en el Panel de control de
     Windows como aplicación instalada.
   - **Modo portable.** La aplicación se ejecuta desde la carpeta
     extraída sin copiar archivos a otras ubicaciones.

La instalación no requiere privilegios de administrador.

### Requisitos del sistema

- Windows 10 versión 1809 o posterior (arquitectura x64).
- 4 GB de RAM mínimo. 6 GB recomendados si se va a utilizar Lumen.
- 500 MB de espacio libre para la aplicación. 800 MB adicionales si se
  activa el modelo Lumen Ligero.

### Advertencia de Windows Defender SmartScreen

Los binarios distribuidos no están firmados con un certificado de
validación extendida (EV) por motivos de costo. Es posible que
SmartScreen presente una advertencia al ejecutar la aplicación por
primera vez. Para continuar:

1. Seleccionar "Más información" en el diálogo.
2. Seleccionar "Ejecutar de todas formas".

---

## iOS

La aplicación compila correctamente para iOS, pero no se distribuye
oficialmente en App Store. La instalación requiere compilación local
con Xcode y sideload mediante una cuenta Apple Developer.

La publicación oficial en App Store está condicionada a la
disponibilidad de los fondos necesarios para el programa Apple
Developer.

---

## macOS y Linux

No existe distribución oficial actualmente. La aplicación compila para
ambas plataformas. Para obtener un binario, solicítese mediante un
issue en el repositorio.

---

## Web

Demostración disponible en línea: <https://nexo.upla.dev>.

Limitaciones de la versión web:

- Las notificaciones no están disponibles (los navegadores móviles
  restringen su uso en pestañas inactivas).
- La integración con Microsoft Teams requiere un proxy CORS y no se
  encuentra habilitada.
- El modelo de Lumen se descarga al cargar el sitio (el almacenamiento
  en caché depende del comportamiento del navegador).

---

## Activación de Lumen

Procedimiento común a todas las plataformas:

1. Localizar el botón flotante de Lumen en la esquina inferior derecha
   de la pantalla principal.
2. Tocar el botón. Se abrirá un diálogo de bienvenida que describe la
   política de privacidad y presenta el selector de modelo.
3. Seleccionar la variante:
   - **Lumen Ligero** (~290 MB). Recomendado para dispositivos con
     2-3 GB de RAM.
   - **Lumen Estándar** (~530 MB). Recomendado para dispositivos con
     4 GB de RAM o superior.
4. Confirmar con "Aceptar y descargar". La descarga es única y solo
   se repite al cambiar de variante.
5. Al finalizar, el asistente queda disponible para su uso.

El modelo se almacena en el directorio privado de la aplicación. Su
eliminación se realiza desde Lumen → Configuración → "Borrar modelo".

Documentación completa del asistente en [`lumen.md`](./lumen.md).

---

## Verificación de integridad

Cada release publica los valores SHA-256 de los archivos distribuidos.
Para verificar la integridad de una descarga:

**PowerShell (Windows):**
```powershell
Get-FileHash -Algorithm SHA256 .\nexo-vX.Y.Z-arm64.apk
```

**Bash (Linux, macOS):**
```bash
sha256sum nexo-vX.Y.Z-arm64.apk
```

Si el valor obtenido no coincide con el publicado en el release, el
archivo está corrupto o ha sido manipulado. En este caso, no debe
instalarse y se recomienda informar del incidente mediante un issue.

---

## Desinstalación

### Android

Mantener pulsado el icono de la aplicación y seleccionar
"Desinstalar". El sistema operativo elimina automáticamente todos los
datos asociados.

### Windows

Panel de control → Aplicaciones → seleccionar "Nexo UPLA" →
Desinstalar. La operación elimina los archivos de la aplicación y la
entrada del registro.

### Eliminación selectiva del modelo Lumen

Lumen → Configuración → "Borrar modelo". Libera el almacenamiento sin
desinstalar la aplicación.

### Cierre de sesión sin pérdida de configuración

Pestaña Perfil → "Cerrar sesión". Conserva las preferencias del
usuario.
