# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SafeTech** — a full-stack e-commerce platform for refurbished electronics with Stripe checkout, warranty claims, and an admin dashboard.

- **Backend**: Bun + Hono (TypeScript), port 3000
- **Frontend**: React 19 + Vite (TypeScript), port 5173
- **Database**: MongoDB via Mongoose (local via Docker)
- **Auth**: Clerk (React SDK on frontend, `@clerk/backend` on server)
- **Payments**: Stripe Checkout Sessions + webhooks
- **File Storage**: Cloudflare R2 (S3-compatible API)

## Commands

### Backend (run from `backend/`)
```bash
bun run dev          # start with hot reload
```

### Frontend (run from `frontend/`)
```bash
npm run dev          # Vite dev server
npm run build        # tsc + vite build
npm run lint         # ESLint
```

### Local MongoDB
```bash
docker compose up -d          # start MongoDB on port 27017
docker compose down           # stop
```

### Seed database
```bash
cd backend && bun run src/seed.ts
```

## Environment Variables

**`backend/.env`**
```
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
RESEND_API_KEY=
EMAIL_FROM=
```

**`frontend/.env.local`**
```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=http://localhost:3000/api   # optional, defaults to this
```

## Architecture

### Backend (`backend/src/`)

All routes are mounted in `index.ts` under `/api/*`. Each feature follows the pattern: `routes/ → controllers/ → models/`.

**Auth middleware** (`middlewares/auth.middleware.ts`):
- `clerkAuthMiddleware` — verifies Clerk JWT, sets `c.get('userId')` to the Clerk user ID
- `adminAuthMiddleware` — same plus a three-layer admin check: MongoDB `User.role`, Clerk token claims, and Clerk API `publicMetadata.role`. All protected admin endpoints must use this middleware.

**Mongoose models** (`models/`): `Product`, `User` (synced from Clerk webhooks), `Order`|, `OrderItem`, `WarrantyReport`, `Technician`. `User` stores `clerk_id` (the Clerk user ID) and `role` (`user` | `admin`).

**Stripe flow**: `POST /api/checkout` creates a Stripe session and a pending `Order`. `POST /api/webhooks/stripe` handles `checkout.session.completed`, marks the order `paid`, and decrements stock in a MongoDB transaction.

**Clerk sync**: `POST /api/webhooks/clerk` handles `user.created`, `user.updated`, and `user.deleted` to keep the local `User` collection in sync with Clerk.

**File uploads** (`upload.controller.ts` + `r2.service.ts`): generates presigned R2 URLs for direct browser uploads.

**Transactional emails** (`services/email.service.ts`): sends purchase confirmations, warranty-created, and warranty/order status-change notifications via the Resend HTTP API (`RESEND_API_KEY`/`EMAIL_FROM`). Without `RESEND_API_KEY` it logs to the console instead of sending. In `E2E_TEST_MODE` it captures messages in memory, inspectable via `GET /api/e2e/emails`.

### Frontend (`frontend/src/`)

**Routing** (`App.tsx`): React Router v7. Public pages use a `<WithNav>` wrapper that adds the nav menu. Protected pages are wrapped in Clerk's `<SignedIn>`. The `/admin` route additionally uses `<ProtectedAdminRoute>`, which calls `/api/auth/me` to verify admin status server-side.

**State management**:
- Cart: Zustand store (`store/cart.store.ts`) persisted to `localStorage` under key `safetech-cart-storage`
- Server data: TanStack Query via custom hooks (`hooks/useProducts.ts`, `hooks/useOrders.ts`)

**API services** (`services/`): Axios-based service modules per domain. All authenticated calls retrieve the Clerk token via `useAuth().getToken()` and pass it as `Authorization: Bearer <token>`.

**Auth** (`providers/ClerkProviderWrapper.tsx`): wraps the app with `<ClerkProvider>` integrated with React Router's `navigate`.

**Admin check**: `components/AdminRoute.tsx` exports `ProtectedAdminRoute` (route guard) and `useAdminCheck` (hook); both hit `/api/auth/me`.

## Key Conventions

- Backend uses ES modules (`"type": "module"`) and runs directly with Bun — no compilation step needed for dev.
- Product `condition` is an enum `A | B | C`; `category` is one of `celular | laptop | pc | auriculares | tablet`.
- Zod validators live in `backend/src/validators/` and are used with `@hono/zod-validator`.
- Frontend uses Tailwind CSS utility classes; `index.css` contains custom global styles.
