# SITRAP 2.1 — piloto operativo local

Primera entrega para ensayar con registros ficticios. No habilitada para operación productiva multiusuario.

## Relación con SITRAP v1
Se incorpora en `public/piloto21` del mismo repositorio. Conserva el sistema Next.js y su conexión Apps Script existentes sin modificaciones. Reutiliza los conceptos de E1/E2, códigos de lotes, calidades, viveros y tickets POS de 58 mm. El piloto no consulta ni escribe la base real. Su despliegue independiente evita alterar el sitio operativo.

## Iniciar una prueba
1. Abrir el enlace del piloto en un navegador normal.
2. Elegir **Cargar ejemplo guiado**, o registrar un alta C3 para comenzar vacío.
3. En **Pedidos y despachos**, abrir el pedido ficticio, asignar un lote y confirmar una entrega parcial con firma ficticia.
4. Revisar la reducción de existencias, la reserva pendiente, el historial y las dos copias del ticket.
5. Cambiar el responsable de prueba en la esquina superior para ensayar Supervisor ITO o AdC MLP.
6. Exportar respaldo JSON desde **Guía de pruebas** antes de borrar datos del navegador. Restaurar reemplaza el ensayo completo, no fusiona registros.

## Arquitectura
- `model.mjs`: validación de comandos, movimientos y proyecciones de existencias; sin dependencias de interfaz.
- `store.mjs`: transacción IndexedDB que guarda estado e historial juntos, evitando escrituras parciales y pérdidas entre pestañas.
- `app.mjs`: interfaz responsive, firma, fotografías, QR, pedidos y ticket.
- `sw.js`: recursos locales para reapertura sin conexión después de la primera carga.
- Identificador único por comando para reintentos; validación de stock en cada confirmación.
- Inventario general incluye tránsito y excluye custodia de devoluciones hasta aceptación ITO.
- Variantes de calidad conservan especie, procedencia, siembra, contenedor y vivero de origen; quedan vinculadas por movimientos.

## Incluido para ensayo
Altas C3; calidad C1/C2/C3; movimientos internos; bajas y ajustes con respaldo; reservas; asignación de lotes; despacho parcial con firma; donaciones autorizadas; traslado y recepción parcial; evaluación ITO; cuarentena y tratamiento; devoluciones con aceptación parcial; historial; QR de lote/ubicación; copia POS; impresión de dos tickets; respaldo y CSV.

## Límites explícitos
Los roles son simulados, sin autenticación. Los registros permanecen en el navegador/dispositivo; no existe sincronización central. Un QR solo resuelve si el dispositivo posee ese ensayo. La firma es evidencia local de prueba. No utilizar datos personales reales ni inventario productivo.

Pendientes para una versión operativa compartida: autenticación y autorizaciones servidor, base transaccional central, sincronización offline con reservas por dispositivo y resolución de conflictos, protocolo de calidad parametrizado por especie, cierre formal de diferencias de traslado, autorización específica de zona de tratamiento, etiquetas A4 y validación física iPhone/Android/impresora MP-58N. Las aprobaciones del procedimiento externo se registran por referencia, no se ejecutan en esta versión.

El control sanitario se aplica a la partida completa recibida que se evalúa; la vinculación de inspecciones de múltiples recepciones parciales debe validarse con ITO antes de producción.

## Verificación
`node --test tests/pilot-model.test.mjs`: diez casos sobre conservación de inventario, reserva, despacho idempotente, firma obligatoria, límites de stock, recepción parcial, devoluciones, donaciones y cuarentena.

Prueba de navegador Chromium: navegación de módulos, carga de ejemplo, reapertura offline y diseño desktop/móvil. La impresión física y la cámara del iPhone requieren prueba en equipo real.
