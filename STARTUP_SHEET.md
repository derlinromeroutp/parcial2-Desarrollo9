# STARTUP SHEET — SafeTech

## Prerequisitos
- Node.js 20+
- Bun 1.x
- Docker Desktop

## Variables de entorno
### Backend `backend/.env`
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/safetech
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

### Frontend `frontend/.env.local`
```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
```

## Arranque rapido
1. Levantar MongoDB:
```bash
docker compose up -d mongodb
```

2. Instalar dependencias:
```bash
cd backend && bun install
cd ../frontend && npm install
cd .. && npm install
```

3. Ejecutar backend:
```bash
cd backend
bun run dev
```

4. Ejecutar frontend:
```bash
cd frontend
npm run dev
```

## Flujo minimo de prueba
1. Abrir `http://localhost:5173`.
2. Validar catalogo y detalle de producto.
3. Iniciar sesion.
4. Agregar producto al carrito y entrar a checkout.
5. Confirmar pago.
6. Revisar `/orders`.
7. Entrar a `/admin` con usuario administrador.

## Suite e2e
La suite Playwright usa un modo de prueba local sin Clerk/Stripe reales.

1. Levantar MongoDB:
```bash
docker compose up -d mongodb
```

2. Ejecutar tests:
```bash
npm run e2e
```

## Notas
- El modo e2e activa `E2E_TEST_MODE=true` en backend y `VITE_E2E_TEST_MODE=true` en frontend.
- En ese modo se exponen rutas de reseteo de datos solo para pruebas.
