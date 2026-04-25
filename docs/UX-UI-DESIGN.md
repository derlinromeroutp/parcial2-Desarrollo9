# 🧠 SafeTech - Documento de Rediseño UX/UI

---

## 📋 Visión General del Sistema

**SafeTech** es una plataforma de e-commerce especializada en tecnología reacondicionada (refurbished) certificada. El sistema permite a usuarios comprar dispositivos con garantía real de 90 días y gestionar reclamos de soporte técnico.

- **Tipo**: E-commerce B2C con panel administrativo
- **Stack**: React + Vite + TypeScript + Clerk (auth) + Stripe (pagos)
- **Estilos**: CSS modules + Tailwind selectivo
- **Rutas principales**: `/`, `/home`, `/orders`, `/warranties/new`, `/admin`, `/login`, `/success`

---

# 🧩 Componentes Reales del Sistema

> Lista completa de componentes React existentes en `src/components/`

## 🎨 Componentes de Presentación (Landing/Catálogo)

### `HeroSection`
- **Ubicación**: `src/components/HeroSection.tsx`
- **Props**: No tiene props (usa `useNavigate` interno)
- **Descripción**: Hero principal de la landing con texto, stats y botón CTA
- **Contenido**: 
  - Texto de valor "Tecnología que funciona — planeta que descansa"
  - Título principal con highlight en color accent
  - Stats: 40+ puntos de inspección, 90 días garantía, -40% precio

### `BenefitsGrid`
- **Ubicación**: `src/components/BenefitsGrid.tsx`
- **Props**: No tiene props
- **Descripción**: Grid de 3 beneficios (Certificación, Garantía, Precio)

### `FeaturedProducts`
- **Ubicación**: `src/components/FeaturedProducts.tsx`
- **Props**: No tiene props
- **Dependencias**: `useProducts` hook, `useCartStore`
- **Descripción**: Muestra 6 productos destacados en la landing
- **Usa内部**: `ProductList` + lógica de add to cart

### `ProductList`
- **Ubicación**: `src/components/ProductList.tsx`
- **Props**: No tiene props (usa `useProducts` hook internamente)
- **Descripción**: Grilla de productos en el catálogo
- **Renderiza**: `product-card` para cada producto

---

## 🛒 Componentes de Carrito

### `CartIcon`
- **Ubicación**: `src/components/CartIcon.tsx`
- **Props**: No tiene props
- **Descripción**: Botón de carrito en el header con contador
- **Usa**: `useCartStore` - toggles drawer, muestra total items
- **Animación**: `bubble-bounce` cuando cambia la cantidad

### `CartDrawer`
- **Ubicación**: `src/components/CartDrawer.tsx`
- **Props**: No tiene props
- **Descripción**: Panel lateral derecho (drawer) con items del carrito
- **Usa**: `useCartStore` + `useAuth` + `checkoutService`
- **Funcionalidad**: 
  - Lista items con controles de cantidad
  - Remove item
  - Subtotal calculation
  - Checkout redirect a Stripe

### **Store: `useCartStore`**
- **Ubicación**: `src/store/cart.store.ts`
- **Tipo**: Zustand store con persistencia localStorage
- **Estado**: `{ items: CartItem[], isDrawerOpen: boolean }`
- **Métodos**: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `toggleDrawer()`

---

## 🖥️ Componentes de Navegación

### `Header`
- **Ubicación**: `src/components/Header.tsx`
- **Props**: No tiene props
- **Descripción**: Header sticky con logo, carrito y controles de auth
- **Usa**: `SignedIn`, `SignedOut`, `SignInButton`, `UserButton` de Clerk
- **MuestraCondicionalmente**: 
  - Logged out: "Iniciar Sesión" button
  - Logged in (cliente): Carrito, "Mis Pedidos", UserButton
  - Logged in (admin): Link a "/admin", UserButton

### `AdminSidebar`
- **Ubicación**: `src/components/AdminSidebar.tsx`
- **Props**:
  ```typescript
  interface AdminSidebarProps {
    onNavigate?: (section: string) => void;
    activeSection?: string;
    isOpen?: boolean;
    onToggle?: () => void;
  }
  ```
- **Descripción**: Sidebar fija izquierda del admin (260px)
- **Nav items**: Dashboard, Órdenes, Garantías, Productos

### `AdminRoute`
- **Ubicación**: `src/components/AdminRoute.tsx`
- **Props**: No tiene props (usa `useAdminCheck` internamente)
- **Descripción**: HOC que protege rutas de admin

---

## 📊 Componentes de Admin

### `StatsCards`
- **Ubicación**: `src/components/StatsCards.tsx`
- **Props**:
  ```typescript
  interface StatsCardsProps {
    orders: Order[] | undefined;
    warranties: IWarranty[] | undefined;
  }
  ```
- **Descripción**: 5 tarjetas de métricas en admin dashboard
- **Cards**: Total Órdenes, Órdenes Pagadas, Ingresos Totales, Tickets Abiertos, Total Garantías

### `ProductTable`
- **Ubicación**: `src/components/ProductTable.tsx`
- **Props**: No tiene props
- **Descripción**: Tabla administrable de productos
- **Funcionalidad**: Crear, editar, eliminar productos
- **Usa**: `ProductModal` para crear/editar

### `ProductModal`
- **Ubicación**: `src/components/ProductModal.tsx`
- **Props**:
  ```typescript
  interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProductDTO | UpdateProductDTO) => Promise<void>;
    product?: Product | null;
    isLoading?: boolean;
  }
  ```
- **Descripción**: Modal de创建/edición de producto
- **Campos**: nombre, descripción, precio, stock, condición, URLs de imagen

---

## 📝 Componentes de Formularios

### `EvidenceUploader`
- **Ubicación**: `src/components/EvidenceUploader.tsx`
- **Props**:
  ```typescript
  interface EvidenceUploaderProps {
    onUploadSuccess: (url: string) => void;
  }
  ```
- **Descripción**: Input de file para subir evidencias (no usado actualmente en NewWarranty)

### `BenefitsGrid`
- **Ubicación**: `src/components/BenefitsGrid.tsx`
- **Props**: No tiene props
- **Descripción**: Grid de 6 beneficios con icons SVGinline
- **Beneficios**: Inspección Rigurosa, Garantía 90 Días, Envío Express, Soporte Humano, Precios Justos, Sostenibilidad

---

# 🖥️ Páginas del Sistema (Con Componentes Reales)

## Página: Landing (`/`) - `src/pages/Landing.tsx`

**Componentes usados**:
- `HeroSection`
- `BenefitsGrid`
- `FeaturedProducts`
- Footer inline (sin componente)
- CTA Banner inline

**Estructura**:
1. `HeroSection`
2. `BenefitsGrid`
3. `FeaturedProducts`
4. CTA Banner section (inline)
5. Footer (inline)

---

## Página: Catálogo (`/home`) - `src/pages/Home.tsx`

**Componentes usados**:
- `ProductList`

**Estructura**:
1. Título "Certified Refurbished" / "Discover Premium Tech"
2. `ProductList` (grilla completa)

---

## Página: Carrito - `CartDrawer` (componente global)

**Componentes usados**:
- `CartDrawer` (renderizado en `Header.tsx`)

**Accesible desde**: Header click en CartIcon

---

## Página: Mis Pedidos (`/orders`) - `src/pages/Orders.tsx`

**Componentes usados**:
- Ningún componente enfant (todo inline)
- `Link` de react-router

**Gestión de garantías**:
- Si pedido < 90 días → muestra botón "Solicitar Garantía" → `/warranties/new?orderId=xxx`

---

## Página:Nueva Garantía (`/warranties/new`) - `src/pages/NewWarranty.tsx`

**Componentes usados**:
- Ningún componente enfant (formulario inline)
- `EvidenceUploader` (NO usado - upload inline)

**Campos del formulario**:
- Select: Motivo (Falla de fábrica, Dañado en tránsito, Error de software, Batería, Otro)
- Textarea:Descripción
- Upload: Evidencias (inline, no EvidenceUploader)

---

## Página:Garantía Exitosa (`/warranties/success`) - `src/pages/WarrantySuccess.tsx`

**Componentes usados**:
- Ningún componente enfant (todo inline con Tailwind)

**⚠️WARNING**: Esta página tiene estilos TOTALMENTE DIFERENTES (Tailwind brutalist)

---

## Página: Login (`/login`) - `src/pages/Login.tsx`

**Componentes usados**:
- Componente `<SignIn />` de Clerk (componente externo)

**⚠️WARNING**: Componente géré par Clerk, pas de personalización

---

## Página: Pago Exitoso (`/success`) - `src/pages/Success.tsx`

**Componentes usados**:
- Ningún componente enfant
- `Link` de react-router

**Funcionalidad**:
- Lee `session_id` de URL params
- Valida con backend via `ordersService`
- Muestra detalles del pedido
- Limpia el carrito

---

## Página: Admin (`/admin`) - `src/pages/AdminDashboard.tsx`

**Componentes usados**:
- `AdminSidebar`
- `StatsCards`
- `ProductTable`
- `ProductModal` (usado por ProductTable)

**Tabs**:
1. Órdenes → Tabla de orders
2. Garantías → Tabla con acciones (assign technician, change status)
3. Productos → `ProductTable`
4. Técnicos → Form inline + Tabla

---

# 🔄 Mapeo de Componentes (Para Rediseño)

> Guía de qué componentes mantener, rediseñar o convertir

| Componente Actual | Acción en Rediseño | Notas |
|------------------|------------------|-------|
| `HeroSection` | **REDISEÑAR** | Mantener lógica, mejorar visuel |
| `BenefitsGrid` | **REDISEÑAR** | Más spacing, mejor jerarquía |
| `FeaturedProducts` | **MANTENER** | Lógica correcta, solo styling |
| `ProductList` | **REDISEÑAR** | Añadir filtros, mejorar cards |
| `CartIcon` | **MANTENER** | Solo ajustes menores |
| `CartDrawer` | **CONVERTIR A PANEL** | → `CartPanel` (mantiene funcionalidad) |
| `useCartStore` | **MANTENER** | Estado correcto, no tocar |
| `Header` | **REDISEÑAR** | Mejorar consistencia visual |
| `AdminSidebar` | **REDISEÑAR** | Mobile-first, mejor responsive |
| `AdminRoute` | **MANTENER** | Lógica de protección correcta |
| `StatsCards` | **REDISEÑAR** | Nuevo layout, mismos datos |
| `ProductTable` | **MANTENER** | Añadir paginación |
| `ProductModal` | **MANTENER** | Solo styling |
| `EvidenceUploader` | **ELIMINAR o USAR** | Está sin usar en NewWarranty |

### Páginas que necesitan redesign completo

| Página | Acción | Urgencia |
|--------|--------|---------|
| Landing | Rediseño visual | ALTA |
| Login (Clerk) | Wrapper con branding | MEDIA |
| Success | Mejorar estados | ALTA |
| WarrantySuccess | REEMPLAZAR completamente | CRÍTICA |
| Admin Dashboard | Añadir paginación, gráficos | MEDIA |

---

# 🎨 Sistema de Diseño Actual (Tokens)

## Colores (CSS Variables)

```css
:root {
  /* Backgrounds */
  --bg-primary: #f8f8f5;      /* BEIGE claro */
  --bg-secondary: #ffffff;     /* Blanco */
  --bg-dark: #121212;          /* Negro */
  --bg-muted: #f0efe8;        /* Beige más oscuro */
  
  /* Textos */
  --text-primary: #121212;
  --text-secondary: #5e5e5e;
  --text-muted: #999999;
  
  /* Accent */
  --accent: #d24e10;          /* NARANJA - brand color */
  --accent-hover: #b4400c;
  --accent-light: #fef3eb;
  
  /* Estados */
  --success: #1a7f37;
  --success-light: #dafbe1;
  --warning: #bf8700;
  --warning-light: #fef8c3;
  --error: #cf222e;
  --error-light: #ffebe9;
  --info: #0969da;
  --info-light: #ddf4ff;
  
  /* Bordes */
  --border: #e5e5e3;
  --border-dark: #121212;
}
```

## Tipografías

```css
--font-display: 'Syne', sans-serif;           /* Body, UI */
--font-serif: 'Cormorant Garamond', serif;  /* Títulos */
```

## Componentes Base (CSS Classes)

```css
/* Buttons */
.btn-primary    /* Negro fill, white text */
.btn-outline   /* Border only */
.btn-secondary /* Secondary style */
.btn-accent    /* Orange fill */

/* Cards */
.card         /* Border 2px, hover effect */
.product-card /* Card de producto */

/* Forms */
.input        /* Input field */
.input-group /* Label + Input */

/* Tables */
.admin-table  /* Table styles */
.badge       /* Estado badges */

/* Layouts */
.page-container  /* Max-width 1280px centered */
.page-section  /* Padding sections */
```

---

# ⚠️ Problemas Críticos para Rediseño

## 1. Inconsistencia Visual Extrema
- `WarrantySuccess.tsx` usa Tailwind puro con estilos "brutalist"
- No guarda relación con el resto del sistema
- **→ CREAR**: página de reemplazo

## 2. Componente Clerk no personalizable
- `<SignIn />` de Clerk no se puede rediseñar
- **→ APLICAR**: Clerk theming o wrapper con branding

## 3. Checkout sin página interna
- Redirect directo a Stripe sin resumen
- **→ CREAR**: página de checkout interna
-Mostrar resumen antes de pagar

## 4. Estados de carga inexistentes
- No hay skeletons
- Solo texto "Cargando..."
- **→ CREAR**: Loading components

## 5. Admin sin paginación
-Tablas cargan todo a la vez
- **→ AÑADIR**: pagination o virtual scrolling

---

# 🎯Scope del Rediseño (Para Claude Design)

## Deben rediseñarse

1. **Landing Page** (`/`)
   - Nuevo Hero más limpio
   - Beneficios mejor jerárquicos
   - Featured Products optimizado

2. **Catálogo** (`/home`)
   - Filtros (condición, precio)
   - Product cards mejoradas
   - Loading states

3. **Carrito**
   - Convertir `CartDrawer` → `CartPanel` intégré
   - Página de checkout con resumen

4. **Mis Pedidos** (`/orders`)
   - Mejorar layout
   - Mejores estados

5. **Garantías**
   - Formulario mejorado
   - **WarrantySuccess** → reemplazar completamente

6. **Admin** (`/admin`)
   - Paginación
   - Mejores tablas
   - Sidebar responsive

7. **Login**
   - Wrapper con branding SafeTech

8. **Pago Exitoso** (`/success`)
   - Mejores estados
   - ID de pedido visible

## No tocar (mantener lógica)

- `useCartStore` (Zustand)
- `AdminRoute` (protección)
- `ProductTable` + `ProductModal` (funcionalidad)
- Rutas de React Router
- Integración con Clerk (solo theming)
- Integración con Stripe (redirección)

---

# 📦 Output Esperado

Después del rediseño, Claude Design debe entregar:

1. **Nuevos componentes React** en `src/components/`
2. **Nuevas páginas** en `src/pages/`
3. **Nuevos estilos** en `src/index.css` o módulos
4. **Todo funcional** - sin romper integración con backend

**Regla de oro**: Mantener interfaces de datos existentes, solo rediseñar presentación.