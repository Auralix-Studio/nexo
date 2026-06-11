# Diagnóstico de problemas

## Problemas de inicio

### La aplicación no abre o se cierra al iniciar

1. Verificar que el dispositivo ejecute Android 7.0 (API 24) o
   superior.
2. Borrar los datos de la aplicación: Configuración del sistema →
   Aplicaciones → Nexo → Almacenamiento → "Borrar datos".
3. Reinstalar la aplicación desde el APK más reciente disponible en
   el [release](https://github.com/auralix-studio/nexo/releases/latest).
4. Si el problema persiste, abrir un issue adjuntando el log obtenido
   con:
   ```bash
   adb logcat -s pe.upla.nexo:* AndroidRuntime:E
   ```

### Mensaje "No se pudo conectar a SIGMA"

1. Comprobar la disponibilidad del portal oficial en
   <https://sigma.upla.edu.pe>. Si el portal tampoco responde, se
   trata de una interrupción del servicio de UPLA.
2. Si el portal funciona pero Nexo no logra conectarse, puede tratarse
   de un problema TLS. La aplicación incluye un almacén actualizado
   de autoridades certificadoras para mitigar este tipo de errores,
   pero ciertos dispositivos antiguos pueden seguir presentando el
   problema. Reportar el incidente indicando el modelo del
   dispositivo y la versión de Android.

### Sesión expirada de forma repetida

1. El token JWT de SIGMA caduca tras un periodo determinado (~2
   horas). Nexo lo renueva automáticamente.
2. Si la expiración ocurre en cada apertura de la aplicación:
   - Cerrar sesión completamente: Perfil → "Cerrar sesión".
   - Volver a autenticarse.
   - Reactivar la opción "Recordar credenciales" si estaba en uso.

---

## Problemas de visualización de datos

### Horario, cuotas o calificaciones aparecen vacíos

1. Realizar pull-to-refresh deslizando hacia abajo en la pantalla
   afectada.
2. Verificar en el portal web oficial si la información existe. Es
   posible que no haya datos para mostrar (por ejemplo, entre
   periodos académicos).
3. Si la información existe en el portal pero no en Nexo, reportar el
   incidente como issue con captura de pantalla.

---

## Problemas con Lumen

### La descarga del modelo falla

- **Error de conexión durante la descarga.** Asegurar una conexión
  Wi-Fi estable. La descarga es de 290 MB o 530 MB según la variante;
  una conexión móvil inestable puede causar interrupciones.
- **La descarga finaliza pero falla en la verificación.** El archivo
  descargado no coincide con el SHA-256 esperado (corrupción durante
  la transferencia). Reintentar la descarga. Si el problema persiste
  de forma sistemática, reportarlo como issue.
- **Mensaje "No disponible aún".** El modelo no está publicado para
  la plataforma actual. Probar con la otra variante o aguardar a una
  versión posterior.

### El asistente tarda excesivamente en responder o no responde

1. Verificar que el dispositivo disponga de al menos 3 GB de RAM
   libres.
2. En dispositivos modestos que utilizan Lumen Estándar (1B), cambiar
   a Lumen Ligero (270M) puede mejorar el rendimiento. Configuración
   de Lumen → "Cambiar modelo".
3. Cerrar otras aplicaciones que consuman memoria.
4. Reiniciar la aplicación.

### Respuestas con caracteres repetidos o sin contenido

Este síntoma indica que el modelo entró en un estado degenerado de
generación. La aplicación incluye un detector que interrumpe estos
casos automáticamente. Si este síntoma persiste, reportarlo
proporcionando:

- Versión exacta de Nexo.
- Consulta que origina el problema.
- Captura de pantalla de la respuesta.
- Variante de Lumen en uso.

---

## Notificaciones

### Las notificaciones no llegan

1. Verificar la autorización: Configuración del sistema →
   Aplicaciones → Nexo → Notificaciones → activar.
2. En dispositivos con interfaces de fabricante agresivas con las
   apps en segundo plano (Xiaomi MIUI, Huawei EMUI, Oppo ColorOS),
   añadir Nexo a la lista de aplicaciones autorizadas para
   ejecutarse en segundo plano o al inicio del sistema.
3. En Android 14 o superior, el sistema operativo puede solicitar
   confirmación adicional para notificaciones programadas exactas
   (utilizadas en los recordatorios de clases). Aceptar dicha
   solicitud cuando aparezca.

---

## Microsoft Teams

### La sección de Teams no carga

- Verificar que la cuenta institucional UPLA tenga Microsoft Teams
  activo. Si la carrera no utiliza Teams, no se mostrará información.
- El administrador de Microsoft 365 de UPLA puede haber restringido
  el acceso de aplicaciones de terceros. En ese caso, la integración
  no podrá habilitarse desde Nexo.
- Para reintentar la autenticación: Configuración → Microsoft →
  "Cerrar sesión Microsoft" → volver a autenticar.

---

## Problemas de interfaz

### Pantalla en blanco

1. En Android, mantener pulsado el icono de la aplicación, abrir la
   información de la app y seleccionar "Forzar detención".
2. Abrir la aplicación de nuevo.
3. Si el problema persiste, reportar como issue adjuntando el log de
   logcat.

### Consumo elevado de batería

El consumo elevado durante la generación de respuestas de Lumen
(5-15 segundos) es esperado y se debe al uso intensivo del
procesador durante la inferencia.

Si se observa consumo elevado cuando el asistente no está en uso,
reportarlo como issue: este comportamiento no es esperado y debe
investigarse.

---

## Procedimiento para reportar problemas

Para que el reporte sea procesable con rapidez, se solicita aportar:

1. **Versión de Nexo:** visible en Perfil → Acerca de Nexo.
2. **Plataforma:** sistema operativo y modelo del dispositivo.
3. **Pasos para reproducir:** secuencia exacta que provoca el
   problema.
4. **Resultado esperado:** descripción del comportamiento correcto.
5. **Resultado obtenido:** descripción del comportamiento real,
   adjuntando captura de pantalla cuando sea posible.
6. **Registros (opcional):** salida de logcat filtrada por la
   aplicación:
   ```bash
   adb logcat -s pe.upla.nexo:* flutter:* AndroidRuntime:E
   ```

Los reportes se gestionan en:

<https://github.com/auralix-studio/nexo/issues>
