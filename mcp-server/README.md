# SafeTech MCP Server

Base tecnica del servidor MCP de SafeTech para el issue `#187`, con transporte HTTP remoto y transporte local por `stdio`.

## Alcance

- Servidor MCP remoto independiente.
- Servidor MCP local por `stdio` para pruebas con clientes MCP.
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
- `MCP_PUBLIC_BASE_URL`
- `OAUTH_ISSUER_URL`
- `OAUTH_SCOPES`
- `OAUTH_RESOURCE_DOCUMENTATION_URL` opcional
- `MCP_STDIO_USER_ID` opcional para modo local
- `MCP_STDIO_ROLE` opcional para modo local (`user` o `admin`)

## Scripts

- `npm run dev`
- `npm run dev:stdio`
- `npm run build`
- `npm run start`
- `npm run start:stdio`
- `npm run test`

## Uso local con cliente MCP

Para probar el servidor como MCP local, levantar primero el backend de SafeTech y luego ejecutar:

```bash
npm run dev:stdio
```

Ese modo no expone URL HTTP. El cliente MCP debe lanzar el proceso por `stdio`, por ejemplo:

```toml
[mcp_servers.safetech]
command = "npm"
args = ["run", "start:stdio", "--prefix", "/ruta/absoluta/a/mcp-server"]
```

En modo `stdio`, el servidor usa una identidad local definida por `MCP_STDIO_USER_ID` y `MCP_STDIO_ROLE`. Esto sirve para pruebas locales y no reemplaza la autenticacion Clerk del transporte HTTP remoto.

## Autenticacion remota

El servidor HTTP remoto mantiene compatibilidad con `Authorization: Bearer <token>` para pruebas manuales y, ademas, publica metadata OAuth del recurso protegido en:

```text
/.well-known/oauth-protected-resource
```

Ese endpoint permite que clientes MCP remotos descubran el issuer OAuth/OIDC configurado. En este proyecto, el issuer esperado es Clerk mediante `OAUTH_ISSUER_URL`.

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
