# SafeTech MCP Server

Base tecnica del servidor MCP de SafeTech para el issue `#187`.

## Alcance

- Servidor MCP remoto independiente.
- Autenticacion base con Clerk.
- Resolucion de identidad y rol.
- Cliente HTTP interno hacia el backend de SafeTech.
- Logging y auditoria base.
- Healthcheck del servicio.

No expone tools de negocio en esta fase.

## Variables

Copiar `.env.example` y definir:

- `BACKEND_API_URL`
- `CLERK_SECRET_KEY`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run test`

## Despliegue

El despliegue se configura manualmente en Render siguiendo estos valores:

- `rootDir`: `mcp-server`
- `buildCommand`: `npm ci && npm run build`
- `startCommand`: `npm run start`
- `healthCheckPath`: `/health`

Variables requeridas:

- `BACKEND_API_URL`
- `CLERK_SECRET_KEY`
- `PORT`
- `HOST`
