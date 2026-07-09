# Plan de Implementacion del MCP de SafeTech

## Objetivo de este documento

Este documento es un runbook de implementacion. Su objetivo es permitir ejecutar en otra sesion la construccion del servidor MCP de SafeTech sin depender de memoria ni asumir contexto no escrito aqui.

El alcance de este plan es:

- Crear un servicio nuevo `mcp-server/`.
- Exponer como tools MCP las capacidades que ya tienen base implementada en SafeTech.
- Integrar autenticacion basada en Clerk y restricciones por rol.
- Reutilizar el backend actual desplegado en Render.
- Preparar pruebas, auditoria y despliegue.

Este documento no ejecuta cambios. Solo define el plan.

## Estado actual confirmado del proyecto

### Arquitectura existente

- `frontend/` desplegado en Vercel.
- `backend/` desplegado en Render.
- Backend en Bun + Hono.
- Autenticacion actual con Clerk.
- Base de datos MongoDB.

### Rutas backend ya disponibles

- Productos: `backend/src/routes/product.routes.ts`
- Pedidos: `backend/src/routes/order.routes.ts`
- Garantias: `backend/src/routes/warranty.routes.ts`
- Tecnicos: `backend/src/routes/technician.routes.ts`
- Auth middleware: `backend/src/middlewares/auth.middleware.ts`

### HUs MCP ya implementadas en el sistema base

Confirmadas por documentacion e issues cerrados:

- `HU-02` / issue `#111` -> `search_products`
- `HU-03` / issue `#112` -> `get_product`
- `HU-08` / issue `#117` -> `list_my_orders`
- `HU-12` / issue `#121` -> `list_my_warranties`
- `HU-13` / issue `#122` -> `create_warranty_claim`
- `HU-16` / issue `#125` -> `update_warranty_status`
- `HU-17` / issue `#126` -> `assign_technician`

### HUs MCP en backlog pero con base backend ya existente

El issue las marcaba como pendientes, pero el codigo actual ya tiene backend y pruebas o base suficiente para exponerlas:

- `HU-26` / issue `#135` -> `create_product`
- `HU-27` / issue `#136` -> `update_product`
- `HU-28` / issue `#137` -> `delete_product`
- `HU-30` / issue `#139` -> `search_products_advanced`

### HUs MCP aun pendientes de logica base

- `HU-37` / issue `#146` -> `get_sales_report`
- `HU-38` / issue `#147` -> `get_warranty_report`
- `HU-42` / issue `#151` -> `create_support_ticket`

## Decision de arquitectura

### Decision principal

Implementar un servicio nuevo llamado `mcp-server/`, separado del `backend/`.

### Por que este enfoque

- Evita mezclar trafico web y trafico MCP dentro del backend actual.
- Permite desplegar y versionar el MCP de forma independiente.
- Reduce el riesgo de romper el frontend o la API publica existente.
- Permite aislar logs, autenticacion, auditoria y rate limits del MCP.

### Despliegue recomendado

- Mantener `frontend` en Vercel.
- Mantener `backend` en Render.
- Desplegar `mcp-server` tambien en Render.

### Relacion entre componentes

Flujo objetivo:

1. Cliente MCP (`Claude`, `Codex`, otro compatible) se conecta a `mcp-server`.
2. `mcp-server` autentica al usuario o servicio.
3. `mcp-server` valida rol y permisos.
4. `mcp-server` llama al backend de SafeTech por HTTP.
5. `mcp-server` normaliza la respuesta a formato MCP.

## Estrategia de gestion de issues

La implementacion del MCP debe organizarse en GitHub de forma consistente con la estrategia actual del repositorio, donde cada HU funcional ya existe como issue.

### Issue inicial de infraestructura MCP

Este trabajo corresponde al issue:

- `#187` Infra MCP - Crear y desplegar el MCP Server base de SafeTech

Crear un issue tecnico dedicado exclusivamente a la base del MCP. Este issue debe cubrir:

- creacion de `mcp-server/`
- configuracion del servidor MCP remoto
- autenticacion base con Clerk
- resolucion de identidad y rol
- logging y auditoria base
- cliente interno para hablar con el backend
- despliegue en Render
- prueba de conectividad del servidor MCP

Este issue no debe incluir tools de negocio.

### Issues de exposicion MCP para HUs ya implementadas

Los siguientes issues tecnicos MCP ya fueron creados para exponer tools sobre HUs cuya logica base ya existe:

- `#188` MCP Tool - Exponer `search_products` (HU-02)
- `#189` MCP Tool - Exponer `get_product` (HU-03)
- `#190` MCP Tool - Exponer `list_my_orders` (HU-08)
- `#191` MCP Tool - Exponer `list_my_warranties` (HU-12)
- `#192` MCP Tool - Exponer `create_warranty_claim` (HU-13)
- `#193` MCP Tool - Exponer `update_warranty_status` (HU-16)
- `#194` MCP Tool - Exponer `assign_technician` (HU-17)
- `#195` MCP Tool - Exponer `create_product` (HU-26)
- `#196` MCP Tool - Exponer `update_product` (HU-27)
- `#197` MCP Tool - Exponer `delete_product` (HU-28)
- `#198` MCP Tool - Exponer `search_products_advanced` (HU-30)

Cada issue tecnico MCP debe referenciar la HU funcional correspondiente del repositorio.

### HUs pendientes que no deben separarse en issues MCP aparte

Las HUs `HU-37`, `HU-38` y `HU-42` deben resolverse dentro de su mismo issue HU, implementando primero la logica backend y luego la exposicion MCP.

### Regla de separacion de trabajo

- Si la HU ya tiene logica base implementada, abrir issue tecnico MCP separado.
- Si la HU aun no tiene logica base implementada, resolver backend + MCP dentro del mismo issue HU.

## Decision de autenticacion y roles

### Identidad del usuario

El MCP debe usar la misma identidad de SafeTech basada en Clerk.

### Regla general

- El MCP no debe inferir identidad desde el prompt.
- El MCP no debe confiar en que la IA diga "soy admin".
- El MCP debe decidir permisos solo con credenciales verificables.

### Estrategia recomendada

Usar autenticacion de usuario final al conectar el MCP y, opcionalmente, credenciales de servicio para automatizaciones internas.

### Reglas por categoria de tools

#### De lectura autenticada

Requieren sesion MCP valida, pero no rol especial. Pueden reutilizar endpoints backend publicos o de bajo riesgo:

- `search_products`
- `get_product`
- `search_products_advanced`

Nota: aunque el endpoint backend de alguna de estas tools pueda ser publico, en la infraestructura MCP actual el acceso al servidor requiere autenticacion. Si en el futuro se quieren tools MCP anonimas, eso debe resolverse como trabajo de infraestructura base.

#### Privadas de usuario autenticado

Requieren identidad del usuario y deben operar solo sobre sus propios datos:

- `list_my_orders`
- `list_my_warranties`
- `create_warranty_claim`
- `create_support_ticket` cuando exista

#### Privadas de admin

Requieren rol `admin`:

- `update_warranty_status`
- `assign_technician`
- `create_product`
- `update_product`
- `delete_product`
- `get_sales_report` cuando exista
- `get_warranty_report` cuando exista

### Doble validacion obligatoria

Toda accion sensible debe validarse en dos capas:

1. `mcp-server` decide si el tool puede ejecutarse.
2. `backend` vuelve a validar autenticacion y rol.

Nunca eliminar validaciones backend por el hecho de que exista el MCP.

## Stack propuesto para `mcp-server`

### Lenguaje y runtime

- TypeScript
- Node.js o Bun

Recomendacion operacional: usar Node.js para el `mcp-server` salvo que se confirme que la libreria MCP elegida y la plataforma de despliegue estan probadas con Bun. Si no hay necesidad fuerte de Bun, priorizar estabilidad del SDK MCP.

### Dependencias esperadas

- SDK oficial de MCP para TypeScript
- Cliente HTTP (`fetch` nativo o `axios`)
- `zod` para validar inputs
- logger estructurado
- libreria de Clerk o verificacion JWT compatible

### Estructura sugerida

```text
mcp-server/
  src/
    index.ts
    server.ts
    config/
      env.ts
    auth/
      authenticate.ts
      authorize.ts
      roles.ts
    tools/
      public/
        search-products.tool.ts
        get-product.tool.ts
        search-products-advanced.tool.ts
      user/
        list-my-orders.tool.ts
        list-my-warranties.tool.ts
        create-warranty-claim.tool.ts
      admin/
        update-warranty-status.tool.ts
        assign-technician.tool.ts
        create-product.tool.ts
        update-product.tool.ts
        delete-product.tool.ts
    services/
      backend-api.ts
      audit-log.ts
    schemas/
      common.ts
      products.ts
      orders.ts
      warranties.ts
    utils/
      errors.ts
      result.ts
```

## Contrato de salida recomendado

Usar respuestas consistentes para todas las tools.

### Exito

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para usar esta herramienta"
  }
}
```

### Reglas de formato

- No devolver estructuras pensadas para UI si no son necesarias.
- Nombrar campos de forma estable.
- Evitar exponer datos internos del backend.
- Convertir errores backend heterogeneos a codigos consistentes del MCP.

## Auditoria y observabilidad

### Log obligatorio por llamada de tool

Registrar:

- timestamp
- request id o correlation id
- nombre del tool
- actor (`userId` o `serviceId`)
- rol detectado
- resultado (`success` o `error`)
- duracion
- codigo de error si aplica

### Politica de privacidad

- No loggear tokens completos.
- No loggear datos sensibles innecesarios.
- En entradas complejas, redactar o truncar payloads sensibles.

### Ubicacion

- Logs del MCP separados de logs del backend.
- Idealmente en la salida estructurada del servicio desplegado en Render.

## Orden exacto de implementacion

### Fase 0 - Preparacion y validacion previa

1. Confirmar version del SDK MCP a usar.
2. Confirmar runtime del servicio (`Node` recomendado).
3. Confirmar URL del backend desplegado.
4. Confirmar variables de entorno necesarias:
   - URL backend
   - `CLERK_SECRET_KEY`
   - cualquier public key o issuer necesario
   - secretos internos del servicio
5. Confirmar si el primer despliegue soportara solo uso autenticado o tambien tools publicas.
6. Confirmar si habra soporte inicial para cuentas de servicio o solo usuarios finales.

### Fase 1 - Scaffold del servicio MCP

1. Crear carpeta `mcp-server/`.
2. Inicializar `package.json`.
3. Agregar TypeScript y scripts:
   - `dev`
   - `build`
   - `start`
   - `lint` si aplica
4. Crear `tsconfig.json`.
5. Instalar SDK MCP y dependencias base.
6. Crear archivo de entorno de ejemplo.
7. Crear estructura minima `src/index.ts`.

Resultado esperado:

- Servicio inicia localmente.
- Responde al handshake MCP.

### Fase 2 - Configuracion base del servidor MCP

1. Crear el servidor MCP con transporte HTTP remoto recomendado.
2. Registrar metadatos del servidor:
   - nombre
   - version
   - descripcion
3. Implementar healthcheck interno del propio servicio.
4. Implementar manejo centralizado de errores en el MCP.
5. Implementar middleware de correlation id.

Resultado esperado:

- El servidor lista tools vacios o de prueba.
- Existe logging base.

### Fase 3 - Cliente interno para hablar con SafeTech backend

1. Crear `backend-api.ts`.
2. Definir metodos wrapper por dominio:
   - `getProducts`
   - `getProductById`
   - `getMyOrders`
   - `getMyWarranties`
   - `createWarrantyClaim`
   - `updateWarrantyStatus`
   - `assignTechnician`
   - `createProduct`
   - `updateProduct`
   - `deleteProduct`
3. Estandarizar propagacion de headers:
   - `Authorization`
   - `X-Request-Id` si se usa
4. Normalizar errores HTTP del backend.

Resultado esperado:

- El MCP puede llamar al backend de forma aislada desde tests o scripts.

### Fase 4 - Autenticacion y autorizacion

1. Implementar extraccion de token o contexto auth.
2. Validar token con Clerk o estrategia equivalente aprobada.
3. Resolver identidad:
   - `userId`
   - `role`
4. Definir helper `requireAuth`.
5. Definir helper `requireAdmin`.
6. Definir helper para tools publicas.
7. Definir politica de rechazo uniforme:
   - `401` si no hay identidad valida
   - `403` si el rol no permite la accion

Resultado esperado:

- El MCP puede distinguir anonimo, `user` y `admin`.

### Fase 5 - Cierre del issue de infraestructura MCP

Esta fase corresponde directamente al issue:

- `#187` Infra MCP - Crear y desplegar el MCP Server base de SafeTech

Para cerrar el issue base del MCP debe estar completo lo siguiente:

1. Servicio `mcp-server/` creado.
2. Transporte MCP remoto operativo.
3. Autenticacion integrada.
4. Resolucion de rol implementada.
5. Cliente interno hacia el backend listo.
6. Logging y auditoria base activos.
7. Despliegue en Render completado.
8. Smoke test de conexion MCP validado.

No se deben incluir tools de negocio en esta fase.

### Fase 6 - Exposicion MCP de HUs ya implementadas

Una vez cerrado el issue de infraestructura MCP, crear e implementar issues tecnicos separados para cada HU ya implementada que solo requiere exposicion como tool.

Una vez cerrado el issue `#187`, implementar los siguientes issues tecnicos MCP:

1. `#188` `search_products`
2. `#189` `get_product`
3. `#190` `list_my_orders`
4. `#191` `list_my_warranties`
5. `#192` `create_warranty_claim`
6. `#193` `update_warranty_status`
7. `#194` `assign_technician`
8. `#195` `create_product`
9. `#196` `update_product`
10. `#197` `delete_product`
11. `#198` `search_products_advanced`

#### Orden recomendado dentro de la fase 6

Primero:

- `#188`
- `#189`

Despues:

- `#190`
- `#191`
- `#192`

Despues:

- `#193`
- `#194`

Finalmente:

- `#195`
- `#196`
- `#197`
- `#198`

### Como leer las fases 7, 8 y 9

Las fases 7, 8 y 9 no deben interpretarse como un bloque que ocurre una sola vez al final de todo el proyecto MCP.

Deben aplicarse en dos niveles:

#### Primer nivel: cierre operativo de `#187`

Despues de completar las fases 0 a 5, aplicar:

- fase 7 para probar el `mcp-server` base
- fase 8 para hacer hardening base
- fase 9 para desplegar la base del MCP

Con esto queda bien cerrado el issue `#187`.

#### Segundo nivel: cierre operativo de `#188` a `#198`

Despues de implementar la fase 6, volver a aplicar:

- fase 7 para probar los tools ya expuestos
- fase 8 para endurecer los tools sensibles o ajustar protecciones adicionales
- fase 9 para desplegar las nuevas capacidades del MCP

Con esto se cierran operativamente los issues de tools.

#### Regla practica

La lectura correcta del plan es:

1. fases 0 a 5 para construir la base y cerrar `#187`
2. fases 7 a 9 para validar, endurecer y desplegar `#187`
3. fase 6 para implementar `#188` a `#198`
4. fases 7 a 9 nuevamente para validar, endurecer y desplegar los tools

Para cada tool seguir exactamente este checklist:

1. Crear `inputSchema`.
2. Crear `outputSchema`.
3. Definir descripcion humana del tool.
4. Validar auth requerida.
5. Llamar al backend.
6. Mapear respuesta backend a formato MCP.
7. Mapear errores a formato consistente.
8. Agregar logs de auditoria.
9. Agregar test unitario o de integracion del tool.

Notas importantes:

- `delete_product` debe tratarse como accion sensible.
- Si el cliente MCP soporta confirmacion humana, aprovecharla.
- Si no la soporta, documentar limitacion y exigir confirmacion explicita por interfaz/cliente.

### Fase 7 - Pruebas del MCP

1. Probar handshake y descubrimiento del servidor.
2. Probar listado de tools.
3. Probar invocacion feliz de cada tool.
4. Probar `401` sin token en tools privadas.
5. Probar `403` para `user` intentando tools admin.
6. Probar errores de validacion de input.
7. Probar errores de backend (`404`, `409`, `500`).
8. Probar auditoria generada.

### Fase 8 - Hardening antes de despliegue

1. Rate limit del MCP.
2. Timeout de llamadas al backend.
3. Retries solo donde sean seguros.
4. Sanitizacion de logs.
5. Sanitizacion de outputs.
6. Confirmar que no se exponen secretos ni headers internos.

### Fase 9 - Despliegue

1. Crear servicio `mcp-server` en Render.
2. Configurar variables de entorno.
3. Configurar build/start command.
4. Desplegar entorno de prueba.
5. Verificar acceso desde cliente MCP compatible.
6. Revisar logs y errores.
7. Promover a entorno objetivo.

## Definicion concreta de tools a exponer en la primera entrega

### De lectura autenticada

#### `search_products`

- Fuente backend: `GET /api/products`
- Input minimo: `query?`
- Input opcional: `name`, `limit`
- Riesgo: bajo
- Requiere autenticacion MCP, aunque el endpoint backend sea publico

#### `get_product`

- Fuente backend: `GET /api/products/:id`
- Input: `productId`
- Riesgo: bajo
- Requiere autenticacion MCP, aunque el endpoint backend sea publico

#### `search_products_advanced`

- Fuente backend: `GET /api/products`
- Input: `name?`, `category?`, `condition?`, `minPrice?`, `maxPrice?`, `available?`, `limit?`
- Riesgo: bajo
- Requiere autenticacion MCP, aunque el endpoint backend sea publico

### Privados de usuario

#### `list_my_orders`

- Fuente backend: `GET /api/orders/mine`
- Input: ninguno en primera version
- Riesgo: datos personales
- Regla: nunca aceptar `userId` como parametro libre

#### `list_my_warranties`

- Fuente backend: `GET /api/warranties/mine`
- Input: ninguno en primera version
- Riesgo: datos personales

#### `create_warranty_claim`

- Fuente backend: `POST /api/warranties`
- Input: `orderId`, `reason`, `description`, `evidenceUrls?`
- Riesgo: escritura sobre datos del usuario

### Privados de admin

#### `update_warranty_status`

- Fuente backend: `PUT /api/warranties/:id/status`
- Input: `warrantyId`, `status`, `repairNotes?`
- Riesgo: alto

#### `assign_technician`

- Fuente backend: `PUT /api/warranties/:id/assign`
- Input actual backend: `warrantyId`, `technicianId`, `technicianName`
- Mejora deseable posterior: resolver `technicianName` en backend
- Riesgo: alto

#### `create_product`

- Fuente backend: `POST /api/products`
- Input: campos validados por `createProductSchema`
- Riesgo: alto

#### `update_product`

- Fuente backend: `PUT /api/products/:id`
- Input: `productId` + payload parcial
- Riesgo: alto

#### `delete_product`

- Fuente backend: `DELETE /api/products/:id`
- Input: `productId`
- Riesgo: alto

## Gaps que deben resolverse durante implementacion

### Gap 1

El issue historico de `HU-26`, `HU-27`, `HU-28`, `HU-30` dice "pendiente", pero el codigo ya existe. Antes de implementar el MCP, tratar estos casos como "backend disponible, MCP pendiente".

### Gap 2

`assignTechnician` actualmente pide `technicianName` junto con `technicianId`. Eso hace el tool menos robusto. Mantener compatibilidad inicialmente, pero registrar mejora para que el backend lo resuelva internamente.

### Gap 3

Algunas respuestas backend no estan normalizadas para uso por agentes. El MCP debe transformarlas, no reenviarlas crudas.

### Gap 4

Todavia no hay auditoria central del lado MCP. Implementarla como parte obligatoria del servicio.

## Criterios de cierre de este trabajo

El trabajo del MCP se considera completo cuando:

1. Existe `mcp-server/` funcional.
2. El servidor puede desplegarse en Render.
3. Las tools definidas arriba aparecen en `tools/list`.
4. Cada tool valida input, auth y rol.
5. Cada tool llama correctamente al backend actual.
6. Los errores salen normalizados.
7. Hay logs de auditoria por llamada.
8. Hay pruebas para casos felices y denegados.

## Relacion con HUs MCP pendientes

Los issues `#187` a `#198` cubren solo infraestructura MCP y exposicion de tools para HUs ya implementadas.

Las HUs pendientes que requieren backend + MCP (`HU-37`, `HU-38`, `HU-42`) se gestionan por separado en `docs/plan-hus-mcp-pendientes.md`.

## Documento complementario

Las HUs MCP cuya logica base aun falta no se implementan con este plan directamente. Para ellas usar `docs/plan-hus-mcp-pendientes.md`.
