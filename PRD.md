# PRD — SafeTech

## Resumen ejecutivo
SafeTech es una plataforma de e-commerce para comercializar tecnologia reacondicionada con experiencia de compra digital, pago seguro, seguimiento de ordenes y gestion de garantias postventa. El objetivo del MVP es demostrar un flujo completo desde catalogo hasta administracion operativa.

## Problema
- Comprar equipos reacondicionados sigue generando desconfianza por falta de trazabilidad, garantia clara y soporte postventa.
- Los comercios pequenos suelen resolver ventas, inventario y garantias en herramientas separadas, lo que vuelve lenta la operacion.

## Objetivos
- Permitir exploracion y compra de productos reacondicionados desde una tienda web moderna.
- Confirmar pagos y registrar ordenes con consistencia de stock.
- Habilitar garantias de 90 dias con evidencia y seguimiento interno.
- Dar a administracion visibilidad de ordenes, productos, garantias y tecnicos.

## Alcance
### Incluido
- Catalogo publico con detalle de producto.
- Carrito persistente.
- Login y control de acceso por rol.
- Checkout con Stripe en entorno real.
- Historial de ordenes para usuarios.
- Creacion y gestion de tickets de garantia.
- Dashboard admin y dashboard tecnico.

### Fuera de alcance actual
- ERP o facturacion avanzada.
- Logistica real con couriers.
- Multi-tenant o multi-sucursal.
- Analitica avanzada y observabilidad productiva.

## Usuarios
- Cliente final: navega, compra y solicita garantia.
- Administrador: gestiona productos, ordenes, garantias y tecnicos.
- Tecnico: atiende garantias asignadas.

## Stack confirmado
- Frontend: React 19, Vite, TypeScript, React Router, TanStack Query, Zustand.
- Backend: Bun, Hono, TypeScript, Mongoose.
- Base de datos: MongoDB.
- Auth: Clerk.
- Pagos: Stripe Payment Element + confirmacion backend.
- Storage: Cloudflare R2 via API S3-compatible.
- Testing e2e: Playwright con modo de prueba controlado.
