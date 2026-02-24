# Sistema de Pedidos y Requerimientos (SisPedidos)

Sistema web completo para la gestión de pedidos y requerimientos internos, con flujo de aprobación por roles, notificaciones en tiempo real, exportación a PDF/Excel y despliegue con Docker.

## Stack Tecnológico

### Backend
- **Node.js 20** + **Express 4**
- **Sequelize ORM** + **MySQL 8**
- **JWT** para autenticación
- **PDFKit** + **ExcelJS** para exportación
- **Multer** para carga de archivos

### Frontend
- **React 18** + **Vite 5**
- **TailwindCSS v3** con temas dinámicos
- **React Router v6** + **Zustand** + **TanStack Query v5**
- **React Hook Form** + **Zod** para validación
- **Recharts** para gráficos
- **Framer Motion** para animaciones
- **Lucide React** para iconografía

### Infraestructura
- **Docker** + **Docker Compose**
- **Nginx** como reverse proxy y servidor de archivos estáticos
- Compatible con **Dokploy**

---

## Requisitos Previos

- **Node.js** >= 18
- **MySQL** >= 8.0
- **npm** o **yarn**
- **Docker** y **Docker Compose** (para despliegue)

---

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Sistema_Pedidos_Requerimentos
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con las credenciales de tu base de datos MySQL local
npm install
```

Configurar `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_pedidos
DB_USER=root
DB_PASS=
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Crear la base de datos:
```sql
CREATE DATABASE sistema_pedidos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar el seeder:
```bash
npm run seed
```

Iniciar el servidor:
```bash
npm run dev
```

El backend correrá en `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

El frontend correrá en `http://localhost:5173`.

---

## Credenciales por defecto

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@sistema.com | Admin1234! |
| Aprobador | aprobador@sistema.com | Aprobador1234! |
| Operador | operador@sistema.com | Operador1234! |

---

## Despliegue con Docker

### Docker Compose

```bash
# Desde la raíz del proyecto
docker-compose up -d --build
```

Esto levanta 3 contenedores:
- **mysql**: Base de datos MySQL 8.0
- **backend**: API Node.js en puerto 3000
- **frontend**: Nginx sirviendo SPA y proxy a la API en puerto 80

### Variables de entorno (Docker)

Crear archivo `.env` en la raíz:

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=sistema_pedidos
MYSQL_USER=sispedidos
MYSQL_PASSWORD=sispedidos123
JWT_SECRET=cambiar_este_secreto_en_produccion
CORS_ORIGIN=*
FRONTEND_PORT=80
BACKEND_PORT=3000
```

### Despliegue con Dokploy

1. Crear un nuevo proyecto en Dokploy
2. Conectar el repositorio Git
3. Seleccionar **Docker Compose** como método de despliegue
4. Apuntar al archivo `docker-compose.yml` en la raíz
5. Configurar las variables de entorno en el panel de Dokploy
6. Desplegar

---

## Estructura del Proyecto

```
Sistema_Pedidos_Requerimentos/
├── backend/
│   ├── server.js                  # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── config/                # Database & JWT config
│       ├── controllers/           # Route handlers
│       ├── middleware/             # Auth, roles, error handling
│       ├── models/                # Sequelize models & associations
│       ├── routes/                # Express routes
│       ├── seeders/               # Database seeders
│       └── services/              # Business logic services
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── layout/            # AppLayout, Sidebar, Topbar
│       │   ├── pedidos/           # Pedido-specific components
│       │   └── ui/                # Reusable UI components
│       ├── hooks/                 # React Query hooks
│       ├── pages/                 # Route pages
│       ├── router/                # React Router config
│       ├── services/              # Axios API services
│       ├── store/                 # Zustand stores
│       ├── styles/                # Global CSS
│       └── utils/                 # Constants, formatters, exports
├── docker-compose.yml
└── README.md
```

---

## Funcionalidades

- **Autenticación JWT** con roles (admin, aprobador, operador, visualizador)
- **Temas dinámicos**: azul para Entidad, verde para Tienda
- **CRUD completo** de pedidos con formulario multi-paso
- **Flujo de aprobación** con estados (borrador → pendiente → aprobado/rechazado → en proceso → completado)
- **Vista Kanban** y tabla con filtros, búsqueda y paginación
- **Dashboard** con KPIs, gráficos de barras y torta
- **Gestión** de usuarios, proveedores y categorías
- **Reportes** con filtros avanzados y export PDF/Excel
- **Notificaciones** en drawer lateral con badge de no leídas
- **Historial/Timeline** de cambios por pedido
- **Diseño responsive** mobile-first
- **Exportación** PDF y Excel desde frontend y backend

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Obtener usuario autenticado |
| PUT | /api/auth/cambiar-password | Cambiar contraseña |
| GET | /api/pedidos | Listar pedidos (con filtros) |
| POST | /api/pedidos | Crear pedido |
| GET | /api/pedidos/:id | Detalle de pedido |
| PUT | /api/pedidos/:id | Actualizar pedido |
| PATCH | /api/pedidos/:id/estado | Cambiar estado |
| DELETE | /api/pedidos/:id | Eliminar pedido |
| GET | /api/pedidos/:id/historial | Historial del pedido |
| GET | /api/usuarios | Listar usuarios |
| POST | /api/usuarios | Crear usuario |
| PUT | /api/usuarios/:id | Actualizar usuario |
| PATCH | /api/usuarios/:id/toggle-activo | Toggle activo/inactivo |
| GET | /api/proveedores | Listar proveedores |
| POST | /api/proveedores | Crear proveedor |
| PUT | /api/proveedores/:id | Actualizar proveedor |
| GET | /api/categorias | Listar categorías |
| POST | /api/categorias | Crear categoría |
| PUT | /api/categorias/:id | Actualizar categoría |
| GET | /api/reportes | Reporte de pedidos |
| GET | /api/reportes/estadisticas | Estadísticas para dashboard |
| GET | /api/notificaciones | Listar notificaciones |
| PATCH | /api/notificaciones/:id/leer | Marcar como leída |
| PATCH | /api/notificaciones/leer-todas | Marcar todas como leídas |

---

## Licencia

MIT
