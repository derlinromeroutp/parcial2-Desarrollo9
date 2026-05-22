# SafeTech

SafeTech es una plataforma full-stack para vender tecnologia reacondicionada con compra online, garantias y panel administrativo. El proyecto combina una vitrina publica, checkout validado por backend y una capa operativa para seguimiento de ordenes, garantias y tecnicos.

## Vision general
- Frontend: React 19, Vite, TypeScript, React Router, TanStack Query y Zustand.
- Backend: Bun, Hono, TypeScript y Mongoose.
- Base de datos: MongoDB.
- Integraciones: Clerk, Stripe y Cloudflare R2.
- Testing: Playwright para flujos criticos e2e.

## Integrantes del grupo
- Derlin Romero
- Ana Patricia Aparicio
- Bruno Ferreira

## Estructura principal
- [PRD.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/PRD.md)
- [REQUIREMENTS.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/REQUIREMENTS.md)
- [ARCHITECTURE.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/ARCHITECTURE.md)
- [STARTUP_SHEET.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/STARTUP_SHEET.md)
- [PITCH.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/PITCH.md)
- [PLAN.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/PLAN.md)
- [PROGRESS.md](C:/Users/derli/OneDrive/Documents/GitHub/parcial2-Desarrollo9/PROGRESS.md)

## Arranque rapido
1. Levanta MongoDB:
```bash
docker compose up -d mongodb
```

2. Instala dependencias:
```bash
cd backend && bun install
cd ../frontend && npm install
cd .. && npm install
```

3. Ejecuta backend y frontend:
```bash
cd backend && bun run dev
cd frontend && npm run dev
```

## URLs locales
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- MongoDB: `mongodb://localhost:27017/safetech`

## Build y pruebas
- Frontend build: `cd frontend && npm run build`
- Frontend lint: `cd frontend && npm run lint`
- E2E Playwright: `npm run e2e`

## Nota sobre pagos
En runtime normal, Stripe maneja el flujo real de pago. En la suite e2e se activa un modo de prueba controlado para validar auth, checkout y admin sin depender de credenciales externas.
