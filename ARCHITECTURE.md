# ARCHITECTURE — SafeTech

## Vision arquitectonica
SafeTech sigue una arquitectura web de tres capas:
- Presentacion: SPA React en `frontend/`.
- Aplicacion/API: servidor Bun + Hono en `backend/`.
- Datos e integraciones: MongoDB, Clerk, Stripe y R2.

## Capas
### Frontend
- `pages/`: pantallas completas.
- `components/`: piezas reutilizables y layout.
- `services/`: clientes HTTP hacia la API.
- `hooks/`: orquestacion de TanStack Query.
- `store/`: estado cliente con Zustand.

### Backend
- `routes/`: definicion de endpoints.
- `controllers/`: coordinacion de casos de uso.
- `models/`: persistencia Mongo con Mongoose.
- `middlewares/`: autenticacion y autorizacion.
- `services/`: logica reutilizable e integraciones.

## Componentes clave
- Catalogo: lectura publica de productos desde MongoDB.
- Checkout: crea PaymentIntent, genera orden pendiente y confirma pago.
- Garantias: crea reportes, lista por rol y permite asignacion de tecnicos.
- Admin: consume ordenes, productos, garantias y tecnicos.
- Auth: Clerk en runtime real; mock controlado en modo e2e.

## Decisiones tecnicas
- Bun + Hono: menor overhead y desarrollo rapido en TypeScript.
- Mongoose: modelado explicito y soporte de relaciones virtuales.
- TanStack Query: control de cache y estado remoto.
- Zustand: carrito simple y persistente sin complejidad adicional.
- Stripe Payment Element: flujo embebido con validacion backend.
- Playwright con `E2E_TEST_MODE`: cobertura critica sin depender de Clerk/Stripe reales.

## Flujo resumido
1. Usuario navega catalogo y agrega items.
2. Frontend solicita a backend crear intento de pago.
3. Backend valida stock y calcula total desde DB.
4. Stripe confirma pago o, en modo e2e, backend simula confirmacion controlada.
5. Backend marca orden como pagada y actualiza stock.
6. Admin visualiza ordenes y garantias.
