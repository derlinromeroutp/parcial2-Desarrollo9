# REQUIREMENTS — SafeTech

## Requerimientos funcionales
- RF-01: El sistema debe listar productos disponibles con nombre, precio, condicion, categoria, stock e imagen.
- RF-02: El sistema debe permitir ver el detalle individual de un producto.
- RF-03: El usuario debe poder agregar, quitar y actualizar cantidades en el carrito.
- RF-04: El carrito debe persistir en `localStorage`.
- RF-05: El sistema debe autenticar usuarios y distinguir roles `user`, `admin` y `technician`.
- RF-06: El checkout debe recalcular precios y validar stock en backend antes de generar el pago.
- RF-07: El sistema debe registrar ordenes y descontar stock cuando el pago sea confirmado.
- RF-08: El usuario autenticado debe consultar sus ordenes.
- RF-09: El usuario autenticado debe poder crear tickets de garantia dentro de la ventana definida por negocio.
- RF-10: El ticket de garantia debe aceptar descripcion y evidencias.
- RF-11: El administrador debe poder consultar todas las ordenes.
- RF-12: El administrador debe poder consultar y actualizar garantias.
- RF-13: El administrador debe poder asignar tecnicos a garantias.
- RF-14: El administrador debe poder gestionar productos.
- RF-15: El tecnico debe poder consultar solo las garantias asignadas.

## Requerimientos no funcionales
- RNF-01: La interfaz debe ser responsiva en desktop y mobile.
- RNF-02: El backend debe exponer API REST tipada y validada con Zod.
- RNF-03: El sistema debe rechazar operaciones protegidas sin token valido.
- RNF-04: El monto del pago nunca debe confiarse al frontend.
- RNF-05: El sistema debe soportar ejecucion local con Docker para MongoDB.
- RNF-06: El frontend debe compilar para produccion con `npm run build`.
- RNF-07: Los flujos criticos deben tener cobertura e2e automatizada.
- RNF-08: Debe existir un modo de prueba que elimine dependencias externas para CI y demos locales.
- RNF-09: La estructura del proyecto debe mantener separacion clara entre rutas, controladores, modelos, hooks, servicios y store.
