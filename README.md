# SafeTech - E-commerce de Tecnología Premium Refurbished

SafeTech es una plataforma de comercio electrónico orientada a la economía circular. Permite a los usuarios explorar, comprar y gestionar garantías de dispositivos tecnológicos reacondicionados (Premium Refurbished) con calidad garantizada.

## 🚀 Tecnologías Principales

**Frontend:**
- React 19 + Vite
- TypeScript
- Clerk (Autenticación)
- Zustand (Manejo de estado global - Carrito)
- TanStack React Query (Gestión de peticiones HTTP y caché)
- React Router Dom

**Backend:**
- Bun (Entorno de ejecución)
- Hono (Framework web ultrarrápido)
- MongoDB & Mongoose (Base de datos y ORM)
- Zod + Hono Validator (Validación de esquemas y datos)

**Infraestructura:**
- Docker & Docker Compose

---

## ⚡ Ejecución Rápida (Docker)

### Requisitos Previos

1. **[Docker](https://www.docker.com/products/docker-desktop/)** - Para ejecutar todos los servicios.

### Pasos

1. **Clonar el repositorio** y abrir una terminal en la raíz del proyecto.

2. **Iniciar todos los servicios:**
   ```bash
   docker compose up -d
   ```

3. **Verificar que todo esté funcionando:**
   ```bash
   # Backend
   curl http://localhost:3000/api/health
   
   # Frontend
   # Abrir http://localhost:5173 en el navegador
   ```

### Acceso a los Servicios

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| MongoDB | localhost:27017 |

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `docker compose up -d` | Iniciar todos los servicios (segundo plano) |
| `docker compose down` | Detener todos los servicios |
| `docker compose logs -f` | Ver logs en tiempo real |
| `docker compose logs -f backend` | Ver logs del backend |
| `docker compose logs -f frontend` | Ver logs del frontend |
| `docker compose build` | Reconstruir las imágenes |
| `docker compose down -v` | Eliminar también los datos de MongoDB |



## 💳 Configuración de Stripe Webhooks (Pagos en tiempo real)

Los webhooks permiten que Stripe notifique al backend cuando un pago se confirma, incluso si el usuario cierra la pestaña antes de llegar a la pantalla de éxito. Sin este paso el sistema igual funciona (hay un mecanismo de respaldo), pero con él las órdenes se marcan como pagadas de forma 100% confiable.

### Opción A — Stripe CLI (recomendada para desarrollo local)

#### 1. Instalar Stripe CLI

**Windows (winget):**
```bash
winget install Stripe.StripeCLI
```

**Windows (manual):** Descargar el `.exe` desde https://github.com/stripe/stripe-cli/releases/latest → agregar al PATH.

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

#### 2. Autenticarse con tu cuenta Stripe
```bash
stripe login
```
Se abre el navegador para confirmar el acceso.

#### 3. Iniciar el listener local

Con el backend ya corriendo (`bun run dev` o Docker), ejecutar en otra terminal:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La terminal imprimirá una línea como esta:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 4. Copiar el secret al `.env`

En `backend/.env`, pegar el valor `whsec_...` obtenido en el paso anterior:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Reiniciar el backend. A partir de ahí, cada pago completado dispara el webhook automáticamente.

---

### Opción B — Sin CLI (respaldo automático)

Si no se configura `STRIPE_WEBHOOK_SECRET`, el sistema usa el mecanismo de confirmación por browser: al completar el pago, la página de éxito llama directamente al backend para marcar la orden como pagada. **Es suficiente para una demo normal.**

Simplemente dejar la variable vacía en `backend/.env`:
```
STRIPE_WEBHOOK_SECRET=
```

---

## 📖 Documentación del Proyecto

Para conocer los detalles sobre los endpoints, los sprints finalizados y la arquitectura del código, revisa los siguientes archivos incluidos en el repositorio:
- `PLAN.md`: Contiene la arquitectura del sistema, el diseño de la API y el backlog principal.
- `PROGRESS.md`: Es la bitácora histórica de los issues completados y los archivos clave generados por cada feature.