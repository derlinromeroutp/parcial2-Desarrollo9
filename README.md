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



## 📖 Documentación del Proyecto

Para conocer los detalles sobre los endpoints, los sprints finalizados y la arquitectura del código, revisa los siguientes archivos incluidos en el repositorio:
- `PLAN.md`: Contiene la arquitectura del sistema, el diseño de la API y el backlog principal.
- `PROGRESS.md`: Es la bitácora histórica de los issues completados y los archivos clave generados por cada feature.