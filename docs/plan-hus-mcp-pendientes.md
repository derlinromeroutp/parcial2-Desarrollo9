# Plan para HUs MCP Pendientes: construir logica y luego exponer tools

## Objetivo de este documento

Este documento cubre solo las historias MCP que aun no tienen la logica base completa en el sistema y, por tanto, no pueden resolverse solo "envolviendo" endpoints existentes.

La meta es definir, para cada HU pendiente:

1. Que backend falta construir.
2. En que orden debe construirse.
3. Como validar la logica.
4. Como exponerla despues como tool MCP.

## Alcance

Historias MCP pendientes reales segun codigo e issues revisados:

- `HU-37` / issue `#146` -> `get_sales_report`
- `HU-38` / issue `#147` -> `get_warranty_report`
- `HU-42` / issue `#151` -> `create_support_ticket`

## Importante: clasificacion corregida

Aunque los issues `HU-26`, `HU-27`, `HU-28` y `HU-30` fueron descritos como pendientes, el codigo actual ya tiene base backend suficiente:

- `HU-26` -> backend existente
- `HU-27` -> backend existente
- `HU-28` -> backend existente
- `HU-30` -> backend existente

Por tanto, esas HUs no pertenecen a este documento. Deben tratarse como "solo falta exponer tool MCP" dentro del plan principal.

## Estrategia de gestion de issues para HUs pendientes

Las HUs `HU-37`, `HU-38` y `HU-42` no deben dividirse en un issue backend y otro issue MCP.

Cada una debe trabajarse dentro de su mismo issue HU original, con dos bloques de ejecucion dentro del mismo esfuerzo:

1. Backend
2. Exposicion MCP

La HU no debe considerarse terminada hasta que ambos bloques esten completos.

## Regla de separacion de trabajo

- Si la HU ya tiene logica base implementada, abrir issue tecnico MCP separado.
- Si la HU aun no tiene logica base implementada, resolver backend + MCP dentro del mismo issue HU.

## Principio general para estas HUs

Para cada HU pendiente seguir siempre este orden:

1. Definir modelo de datos o agregacion requerida.
2. Implementar logica de dominio.
3. Implementar endpoint backend protegido.
4. Validar con pruebas.
5. Solo despues exponer como tool MCP.

No crear tools MCP que dependan de logica no implementada o reportes calculados por la IA.

## HU-37: `get_sales_report`

### Objetivo funcional

Como administrador, consultar un reporte consolidado de ventas desde un agente IA, devolviendo ventas, ingresos y volumen de pedidos para un rango de fechas.

### Lo que ya existe

- Modelo `Order`
- Flujo de pagos y ordenes
- Endpoint admin para listar todas las ordenes

### Lo que falta construir

- Logica agregada de reportes
- Endpoint especifico de reporte para admin
- Validacion de rango de fechas
- Formato de salida estable

### Decisiones de implementacion

#### Fuente de verdad

Usar datos del backend y la base de datos. Nunca calcular el reporte desde la IA.

#### Filtro base

El reporte debe operar sobre ordenes confirmadas o pagadas. Antes de implementar, revisar el modelo `Order` y confirmar que el campo de estado objetivo sea `paid`.

#### Input recomendado

- `from`
- `to`
- opcional `groupBy` en una fase posterior

Primera version: solo rango de fechas.

#### Output recomendado

```json
{
  "summary": {
    "ordersCount": 0,
    "grossRevenue": 0,
    "averageOrderValue": 0
  },
  "range": {
    "from": "",
    "to": ""
  }
}
```

### Backend a crear

#### Validacion

Crear schema Zod para:

- `from` requerido y fecha valida
- `to` requerido y fecha valida
- `from <= to`

#### Servicio

Crear un servicio de reportes, por ejemplo:

- `backend/src/services/report.service.ts`

Funcion sugerida:

- `getSalesReport({ from, to })`

Debe:

1. filtrar ordenes por fecha
2. filtrar estados pertinentes
3. contar ordenes
4. sumar ingresos
5. calcular ticket promedio

#### Endpoint

Crear ruta admin, por ejemplo:

- `GET /api/reports/sales`

Debe usar:

- `adminAuthMiddleware`
- validador Zod

#### Controlador

Crear controlador dedicado, por ejemplo:

- `backend/src/controllers/report.controller.ts`

### Pruebas necesarias antes del MCP

1. Devuelve reporte para rango valido.
2. Rechaza rango invalido.
3. Devuelve cero sin fallar si no hay datos.
4. Rechaza usuario no admin.
5. Verifica que solo use datos reales del backend.

### Exposicion posterior como tool MCP

Tool:

- `get_sales_report`

Auth:

- solo admin

Input MCP:

- `from`
- `to`

Regla:

- el MCP no calcula nada; solo llama al endpoint backend.

### Forma de ejecucion en GitHub

Esta HU debe resolverse dentro del issue `HU-37` sin crear un issue MCP separado.

Bloque backend:

- crear servicio de reporte de ventas
- crear endpoint admin
- validar rango de fechas
- agregar pruebas backend

Bloque MCP:

- exponer `get_sales_report`
- validar rol admin en el MCP
- normalizar salida
- agregar pruebas MCP

## HU-38: `get_warranty_report`

### Objetivo funcional

Como administrador, consultar un reporte de garantias con cantidad de casos por estado, periodo y tecnico.

### Lo que ya existe

- Modelo `WarrantyReport`
- Estados de garantias
- Tecnicos asignados
- Rutas admin sobre garantias

### Lo que falta construir

- Agregaciones de reporte
- Filtros por fechas
- Resumen por tecnico
- Endpoint especifico para reportes

### Input recomendado

- `from`
- `to`
- opcional `technicianId`

Primera version: solo `from` y `to`. `technicianId` puede dejarse previsto como ampliacion.

### Output recomendado

```json
{
  "summary": {
    "totalCases": 0
  },
  "byStatus": [
    { "status": "pending", "count": 0 }
  ],
  "byTechnician": [
    {
      "technicianId": "t1",
      "technicianName": "Maria Gomez",
      "count": 0
    }
  ],
  "range": {
    "from": "",
    "to": ""
  }
}
```

### Backend a crear

#### Validacion

Crear schema Zod para:

- `from`
- `to`
- opcional `technicianId`
- validacion de rango

#### Servicio

Agregar a `report.service.ts` o crear modulo similar:

- `getWarrantyReport({ from, to, technicianId? })`

Debe:

1. filtrar garantias por fecha
2. contar total
3. agrupar por estado
4. agrupar por tecnico
5. devolver datos agregados listos para consumir

#### Endpoint

Crear ruta admin, por ejemplo:

- `GET /api/reports/warranties`

#### Controlador

Extender `report.controller.ts` o crear uno especifico de reportes.

### Pruebas necesarias antes del MCP

1. Devuelve conteos por estado.
2. Devuelve conteos por tecnico.
3. Filtra por rango valido.
4. Rechaza rango invalido.
5. Rechaza usuario no admin.

### Exposicion posterior como tool MCP

Tool:

- `get_warranty_report`

Auth:

- solo admin

Input MCP:

- `from`
- `to`
- opcional `technicianId` si se implementa desde el inicio

### Forma de ejecucion en GitHub

Esta HU debe resolverse dentro del issue `HU-38` sin crear un issue MCP separado.

Bloque backend:

- crear servicio de reporte de garantias
- crear endpoint admin
- validar rango de fechas
- agregar pruebas backend

Bloque MCP:

- exponer `get_warranty_report`
- validar rol admin en el MCP
- normalizar salida
- agregar pruebas MCP

## HU-42: `create_support_ticket`

### Objetivo funcional

Como cliente autenticado, abrir tickets de soporte desde un agente IA, asociando el ticket al usuario autenticado.

### Lo que ya existe

No hay sistema de tickets implementado actualmente.

### Dependencia funcional

`HU-42` depende de construir primero la base de `HU-41`:

- modelo de ticket
- endpoint de creacion
- estado inicial del ticket
- identificador unico

### Decision minima para primera version

Implementar una version reducida y suficiente para la HU:

- crear ticket
- guardar categoria
- guardar descripcion
- guardar canal de contacto
- asociarlo al usuario autenticado
- devolver identificador y estado

No intentar construir desde el inicio un sistema completo de soporte multicanal si no es necesario para cerrar la HU.

### Modelo sugerido

Crear modelo nuevo, por ejemplo:

- `SupportTicket`

Campos minimos:

- `_id`
- `userId`
- `category`
- `description`
- `contactChannel`
- `status`
- `createdAt`
- `updatedAt`

Estados minimos:

- `open`
- `in_review`
- `closed`

Primera version puede iniciar siempre en `open`.

### Backend a crear

#### Modelo

Crear:

- `backend/src/models/SupportTicket.ts`

#### Validador

Crear schema Zod:

- `category` requerido
- `description` requerido con minimo de longitud
- `contactChannel` requerido

#### Controlador

Crear:

- `backend/src/controllers/support.controller.ts`

Funcion inicial:

- `createSupportTicket`

Debe:

1. obtener `userId` desde auth
2. validar payload
3. crear ticket con `status = open`
4. devolver `ticketId` y `status`

#### Ruta

Crear:

- `backend/src/routes/support.routes.ts`

Ruta inicial:

- `POST /api/support-tickets`

Debe usar `clerkAuthMiddleware`.

#### Registro en index

Montar la ruta nueva en `backend/src/index.ts`.

### Pruebas necesarias antes del MCP

1. Crea ticket valido.
2. Rechaza sin autenticacion.
3. Rechaza payload invalido.
4. Guarda `userId` correcto.
5. Devuelve identificador y estado.

### Exposicion posterior como tool MCP

Tool:

- `create_support_ticket`

Auth:

- usuario autenticado

Input MCP:

- `category`
- `description`
- `contactChannel`

Output MCP recomendado:

```json
{
  "success": true,
  "data": {
    "ticketId": "abc123",
    "status": "open"
  }
}
```

### Forma de ejecucion en GitHub

Esta HU debe resolverse dentro del issue `HU-42` sin crear un issue MCP separado.

Bloque backend:

- crear modelo `SupportTicket`
- crear endpoint autenticado de creacion
- agregar validaciones
- agregar pruebas backend

Bloque MCP:

- exponer `create_support_ticket`
- validar usuario autenticado en el MCP
- normalizar salida
- agregar pruebas MCP

## Orden de implementacion recomendado para las HUs pendientes

### Orden recomendado

1. `HU-42`
2. `HU-37`
3. `HU-38`

### Justificacion

- `HU-42` introduce un dominio nuevo y aislado; conviene cerrarlo primero.
- `HU-37` y `HU-38` comparten patron de reportes agregados; una vez resuelto uno, el otro sera mas rapido.

## Checklist obligatorio por HU pendiente

Para cada una de estas historias, seguir esta secuencia exacta:

1. Revisar issue y criterios de aceptacion.
2. Identificar si hace falta modelo nuevo o solo agregacion.
3. Crear schema de validacion Zod.
4. Crear servicio o logica de dominio.
5. Crear controlador.
6. Crear ruta protegida.
7. Registrar ruta en `index.ts`.
8. Probar caso feliz.
9. Probar denegacion por auth/rol.
10. Probar errores de validacion.
11. Solo despues crear el tool MCP correspondiente.

## Criterios de cierre

Este documento se considera ejecutado correctamente cuando:

1. Existen endpoints backend reales para `HU-37`, `HU-38` y `HU-42`.
2. Las validaciones estan cubiertas con tests.
3. Los permisos se aplican correctamente.
4. Cada una puede ser expuesta luego como tool MCP sin que la IA haga calculos o sustituciones de logica backend.

## Relacion con el plan principal

Una vez implementada la logica descrita aqui, volver a `docs/plan-implementacion-mcp-safetech.md` y agregar estos tools al `mcp-server`:

- `get_sales_report`
- `get_warranty_report`
- `create_support_ticket`
