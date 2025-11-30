# 📊 Diagrama de Flujo - StockApp Company

## 🏗️ Arquitectura General de la Aplicación

```mermaid
graph TB
    Start([Usuario]) --> Login{¿Autenticado?}
    Login -->|No| LoginPage[/login/page.tsx]
    LoginPage -->|Credenciales válidas| Auth[Supabase Auth]
    Auth -->|Sesión válida| DashboardLayout[DashboardLayout]
    Login -->|Sí| DashboardLayout
    
    DashboardLayout --> Sidebar[Sidebar Navigation]
    DashboardLayout --> Header[Header con Toggle Tema]
    DashboardLayout --> Content[Contenido de Página]
    
    Sidebar --> Dashboard[/dashboard - Vista General]
    Sidebar --> Ventas[/dashboard/ventas - Venta Producto]
    Sidebar --> Entradas[/dashboard/entradas - Agregar Producto]
    Sidebar --> Stock[/dashboard/stock - Gestión de Stocks]
    Sidebar --> Salidas[/dashboard/stock-salidas - Historial Salidas]
    Sidebar --> Config[/dashboard/configuracion - Configuración]
    Sidebar --> Admin[/dashboard/admin - Administración]
    
    Dashboard --> Stats[Estadísticas Dashboard]
    Dashboard --> RecentMovements[Movimientos Recientes]
    
    style Start fill:#e1f5ff
    style Login fill:#fff4e1
    style DashboardLayout fill:#e8f5e9
    style Auth fill:#f3e5f5
```

## 🔄 Flujo de Datos Principal

```mermaid
graph LR
    Client[Cliente Next.js] --> SupabaseClient[Supabase Client]
    SupabaseClient --> Auth[Supabase Auth]
    SupabaseClient --> Database[(Supabase Database)]
    
    Database --> Users[(users)]
    Database --> Products[(products)]
    Database --> Movements[(movements)]
    
    Auth --> Users
    Products --> Movements
    Users --> Movements
    
    style Database fill:#4caf50
    style Auth fill:#2196f3
    style Client fill:#ff9800
```

## 📦 Estructura de Base de Datos

```mermaid
erDiagram
    USERS ||--o{ MOVEMENTS : "realiza"
    PRODUCTS ||--o{ MOVEMENTS : "tiene"
    
    USERS {
        uuid id PK
        string email
        enum role "admin|empleado"
        string name
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        uuid id PK
        string name
        string sku UK
        string barcode UK
        string category
        string unit
        integer current_stock
        integer min_stock
        integer max_stock
        decimal price
        timestamp created_at
        timestamp updated_at
    }
    
    MOVEMENTS {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        enum type "entrada|salida"
        integer quantity
        string reason
        date fecha
        time hora
        integer tiempo_produccion
        string despachado_por
        timestamp created_at
    }
```

## 🛒 Flujo de Venta de Productos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant VP as Ventas Page
    participant BS as BarcodeScanner
    participant Cart as Carrito
    participant DB as Database
    participant Stock as Stock Update
    
    U->>VP: Accede a /dashboard/ventas
    U->>BS: Escanea código de barras
    BS->>DB: Busca producto por barcode
    DB-->>BS: Retorna producto
    BS->>Cart: Agrega producto al carrito
    Cart->>Cart: Suma cantidad si existe
    
    U->>VP: Busca producto manualmente
    VP->>DB: Busca por nombre/SKU/barcode
    DB-->>VP: Retorna productos
    VP->>Cart: Agrega producto seleccionado
    
    U->>Cart: Ajusta cantidades
    U->>VP: Click en "Vender"
    VP->>DB: Valida stock disponible
    DB-->>VP: Stock válido
    VP->>DB: Crea movimiento tipo "salida"
    DB->>Stock: Trigger actualiza stock
    Stock->>DB: Disminuye current_stock
    DB-->>VP: Venta registrada
    VP-->>U: Confirmación de venta
```

## 📥 Flujo de Entrada de Productos

```mermaid
flowchart TD
    Start([Usuario en /dashboard/entradas]) --> Choice{¿Producto existe?}
    
    Choice -->|No| CreateNew[Crear Nuevo Producto]
    Choice -->|Sí| UpdateStock[Actualizar Stock Existente]
    
    CreateNew --> FormNew[Formulario Nuevo Producto]
    FormNew --> FieldsNew[Nombre, SKU, Barcode, Categoría, Unidad, Stock Mínimo, Precio, Stock Inicial]
    FieldsNew --> ValidateNew{Validar datos}
    ValidateNew -->|Inválido| ErrorNew[Mostrar Error]
    ValidateNew -->|Válido| InsertProduct[Insertar en products]
    InsertProduct --> HasStock{¿Stock inicial > 0?}
    HasStock -->|Sí| CreateMovement[Crear movimiento entrada]
    HasStock -->|No| SuccessNew[Producto creado]
    CreateMovement --> SuccessNew
    
    UpdateStock --> SelectProduct[Seleccionar Producto]
    SelectProduct --> FormUpdate[Formulario Actualizar Stock]
    FormUpdate --> InputStock[Ingresar cantidad a agregar]
    InputStock --> ValidateStock{Validar cantidad}
    ValidateStock -->|Inválido| ErrorStock[Mostrar Error]
    ValidateStock -->|Válido| UpdateProduct[Actualizar current_stock]
    UpdateProduct --> CreateMovementEntrada[Crear movimiento entrada]
    CreateMovementEntrada --> SuccessUpdate[Stock actualizado]
    
    ErrorNew --> FormNew
    ErrorStock --> FormUpdate
    SuccessNew --> Refresh[Refrescar lista]
    SuccessUpdate --> Refresh
    
    style Start fill:#e1f5ff
    style SuccessNew fill:#c8e6c9
    style SuccessUpdate fill:#c8e6c9
    style ErrorNew fill:#ffcdd2
    style ErrorStock fill:#ffcdd2
```

## 📊 Flujo del Dashboard

```mermaid
flowchart TD
    Load[loadDashboardData] --> GetProducts[Obtener Total Productos]
    Load --> GetLowStock[Obtener Productos Stock Bajo]
    Load --> GetNewProducts[Productos Nuevos 30 días]
    Load --> GetSales[Ventas últimos 30 días]
    Load --> GetRevenue[Total Ingresos últimos 30 días]
    Load --> GetSoldQty[Total Productos Vendidos]
    Load --> GetRecentMovements[Movimientos Recientes últimos 10]
    
    GetProducts --> CountProducts[Contar productos únicos]
    GetLowStock --> FilterLowStock[Filtrar current_stock <= min_stock]
    GetNewProducts --> FilterDate[Filtrar por created_at últimos 30 días]
    GetSales --> FilterSales[Filtrar movements tipo 'salida' últimos 30 días]
    GetRevenue --> CalcRevenue[Sumar price * quantity de ventas]
    GetSoldQty --> SumQty[Sumar quantity de ventas]
    GetRecentMovements --> JoinData[Join con products y users]
    
    CountProducts --> DisplayStats[Mostrar Estadísticas]
    FilterLowStock --> DisplayStats
    FilterDate --> DisplayStats
    FilterSales --> DisplayStats
    CalcRevenue --> DisplayStats
    SumQty --> DisplayStats
    JoinData --> DisplayMovements[Mostrar Tabla Movimientos]
    
    DisplayStats --> DashboardUI[Dashboard UI]
    DisplayMovements --> DashboardUI
    
    style Load fill:#e1f5ff
    style DisplayStats fill:#c8e6c9
    style DisplayMovements fill:#c8e6c9
```

## 🔐 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant LP as Login Page
    participant MW as Middleware
    participant Auth as Supabase Auth
    participant DB as Database
    participant DL as Dashboard Layout
    
    U->>LP: Ingresa credenciales
    LP->>Auth: signInWithPassword
    Auth->>DB: Verifica usuario
    DB-->>Auth: Usuario válido
    Auth-->>LP: Sesión creada
    LP->>MW: Redirige a /dashboard
    MW->>Auth: Verifica sesión
    Auth-->>MW: Sesión válida
    MW->>DL: Permite acceso
    DL->>DB: Obtiene rol de usuario
    DB-->>DL: Retorna rol
    DL->>DL: Renderiza según rol
    
    Note over MW: Protege rutas /dashboard/*
    Note over DL: Muestra/oculta opciones según rol
```

## 🎨 Flujo de Tema (Light/Dark)

```mermaid
graph LR
    User[Usuario] --> Toggle[Toggle Button]
    Toggle --> ThemeStore[Zustand Theme Store]
    ThemeStore --> Persist[LocalStorage]
    ThemeStore --> ThemeProvider[ThemeProvider]
    ThemeProvider --> HTML[HTML Element]
    HTML --> Tailwind[Tailwind CSS Classes]
    Tailwind --> UI[UI Components]
    
    style ThemeStore fill:#f3e5f5
    style Persist fill:#fff4e1
    style ThemeProvider fill:#e8f5e9
```

## 📱 Estructura de Componentes

```mermaid
graph TD
    Root[app/layout.tsx] --> Providers[app/providers.tsx]
    Providers --> ThemeProvider[ThemeProvider]
    Providers --> App[App Router]
    
    App --> LoginPage[app/login/page.tsx]
    App --> DashboardLayout[app/dashboard/layout.tsx]
    
    DashboardLayout --> DashboardSidebar[DashboardLayout Component]
    DashboardSidebar --> SidebarNav[Sidebar Navigation]
    DashboardSidebar --> Header[Header con Toggle]
    
    DashboardLayout --> DashboardPages[Páginas Dashboard]
    DashboardPages --> DashboardHome[app/dashboard/page.tsx]
    DashboardPages --> VentasPage[app/dashboard/ventas/page.tsx]
    DashboardPages --> EntradasPage[app/dashboard/entradas/page.tsx]
    DashboardPages --> StockPage[app/dashboard/stock/page.tsx]
    DashboardPages --> SalidasPage[app/dashboard/stock-salidas/page.tsx]
    DashboardPages --> ConfigPage[app/dashboard/configuracion/page.tsx]
    DashboardPages --> AdminPage[app/dashboard/admin/page.tsx]
    
    VentasPage --> BarcodeScanner[BarcodeScanner Component]
    VentasPage --> Cart[Carrito de Compras]
    
    style Root fill:#e1f5ff
    style Providers fill:#fff4e1
    style DashboardLayout fill:#e8f5e9
```

## 🔄 Flujo de Actualización de Stock

```mermaid
sequenceDiagram
    participant User as Usuario
    participant App as Aplicación
    participant DB as Database
    participant Trigger as Database Trigger
    participant Products as Tabla Products
    
    User->>App: Crea movimiento (entrada/salida)
    App->>DB: INSERT INTO movements
    DB->>Trigger: Trigger update_product_stock()
    
    alt Tipo = 'entrada'
        Trigger->>Products: UPDATE current_stock = current_stock + quantity
    else Tipo = 'salida'
        Trigger->>Products: UPDATE current_stock = current_stock - quantity
    end
    
    Products-->>Trigger: Stock actualizado
    Trigger-->>DB: Movimiento completado
    DB-->>App: Movimiento registrado
    App-->>User: Confirmación
    
    Note over Trigger: Automático - No requiere código adicional
```

## 📋 Páginas y Funcionalidades

| Página | Ruta | Funcionalidad Principal | Componentes Clave |
|--------|------|------------------------|-------------------|
| **Login** | `/login` | Autenticación de usuarios | Formulario de login |
| **Dashboard** | `/dashboard` | Vista general con estadísticas | Cards de estadísticas, Tabla de movimientos |
| **Ventas** | `/dashboard/ventas` | Proceso de venta de productos | BarcodeScanner, Carrito, Resumen |
| **Entradas** | `/dashboard/entradas` | Agregar productos y actualizar stock | Formulario nuevo producto, Selector de productos |
| **Stock** | `/dashboard/stock` | Gestión y visualización de inventario | Tabla de productos, Filtros, Modal edición |
| **Stock Salidas** | `/dashboard/stock-salidas` | Historial de ventas/salidas | Tabla de movimientos, Filtros por fecha |
| **Configuración** | `/dashboard/configuracion` | Perfil de usuario | Formularios email, nombre, contraseña |
| **Admin** | `/dashboard/admin` | Administración de usuarios | Gestión de roles (solo admin) |

## 🗂️ Estructura de Archivos

```
StockApp-Company/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── layout.tsx            # Layout del dashboard
│   │   ├── ventas/page.tsx       # Página de ventas
│   │   ├── entradas/page.tsx     # Página de entradas
│   │   ├── stock/page.tsx        # Gestión de stock
│   │   ├── stock-salidas/page.tsx # Historial de salidas
│   │   ├── configuracion/page.tsx # Configuración usuario
│   │   └── admin/page.tsx        # Administración
│   ├── login/page.tsx            # Página de login
│   ├── layout.tsx                # Layout raíz
│   └── providers.tsx             # Providers (Theme)
├── components/
│   ├── Layout/
│   │   └── DashboardLayout.tsx   # Layout con sidebar
│   ├── BarcodeScanner.tsx        # Componente escáner
│   └── ThemeProvider.tsx         # Provider de tema
├── lib/
│   ├── supabase/
│   │   └── client.ts             # Cliente Supabase
│   ├── store/
│   │   └── themeStore.ts         # Store Zustand (tema)
│   └── types.ts                  # Tipos TypeScript
└── supabase/
    └── schema.sql                # Schema de base de datos
```

## 🔑 Conceptos Clave

### **Autenticación y Autorización**
- Supabase Auth maneja la autenticación
- Middleware protege rutas `/dashboard/*`
- Roles: `admin` y `empleado`
- RLS (Row Level Security) en Supabase

### **Gestión de Estado**
- **Local**: `useState` para estado de componentes
- **Global**: Zustand para tema (light/dark)
- **Persistencia**: LocalStorage para preferencia de tema

### **Base de Datos**
- **Trigger automático**: Actualiza stock al crear movimientos
- **Relaciones**: Foreign keys entre users, products y movements
- **Índices**: Optimización en búsquedas por SKU, barcode, fechas

### **Funcionalidades Especiales**
- **Escáner de código de barras**: Integración USB/HID
- **Tema claro/oscuro**: Toggle global con persistencia
- **Exportación CSV**: Descarga de datos de tablas
- **SweetAlert2**: Alertas y confirmaciones mejoradas

---

**Nota**: Este diagrama representa la estructura actual de la aplicación. Para visualizar los diagramas Mermaid, puedes usar:
- [Mermaid Live Editor](https://mermaid.live/)
- Extensiones de VS Code como "Markdown Preview Mermaid Support"
- GitHub (renderiza automáticamente en archivos .md)

