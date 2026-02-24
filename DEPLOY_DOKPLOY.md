# 🚀 Despliegue en Dokploy — Guía paso a paso

Guía completa para desplegar **Sistema de Pedidos y Requerimientos** en un VPS usando el panel web de Dokploy, con dominio propio y HTTPS automático.

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Preparar el repositorio en GitHub](#2-preparar-el-repositorio-en-github)
3. [Instalar Dokploy en el VPS](#3-instalar-dokploy-en-el-vps)
4. [Acceder al panel de Dokploy](#4-acceder-al-panel-de-dokploy)
5. [Conectar GitHub con Dokploy](#5-conectar-github-con-dokploy)
6. [Crear el proyecto en Dokploy](#6-crear-el-proyecto-en-dokploy)
7. [Crear el servicio Docker Compose](#7-crear-el-servicio-docker-compose)
8. [Configurar variables de entorno](#8-configurar-variables-de-entorno)
9. [Asignar dominio y activar HTTPS](#9-asignar-dominio-y-activar-https)
10. [Hacer el primer deploy](#10-hacer-el-primer-deploy)
11. [Ejecutar el seed (datos iniciales)](#11-ejecutar-el-seed-datos-iniciales)
12. [Verificar que todo funcione](#12-verificar-que-todo-funcione)
13. [Actualizar la app (re-deploy)](#13-actualizar-la-app-re-deploy)
14. [Solución de problemas comunes](#14-solución-de-problemas-comunes)

---

## 1. Requisitos previos

Antes de empezar necesitas tener:

| Requisito | Detalle |
|-----------|---------|
| VPS | Ubuntu 22.04 LTS (mínimo 1 vCPU / 1 GB RAM, recomendado 2 GB) |
| Acceso SSH | Usuario con privilegios `sudo` o `root` |
| Dominio | Con acceso a los registros DNS (A records) |
| Cuenta GitHub | El código del proyecto subido a un repositorio |

> **Nota:** Dokploy necesita al menos 512 MB de RAM pero para este stack (MySQL + Node + Nginx) se recomienda **2 GB o más**.

---

## 2. Preparar el repositorio en GitHub

El código debe estar en un repositorio GitHub accesible. Si ya hiciste `git push`, este paso está listo.

### 2.1 Verificar que el repositorio tiene los archivos clave

Asegúrate de que en la raíz de tu repositorio estén los siguientes archivos (todos deben estar commiteados):

```
├── docker-compose.yml          ← orquesta los 3 servicios
├── .env.example                ← plantilla de variables de entorno
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   └── src/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
```

### 2.2 El `.env` NO debe estar commiteado

Verifica que `.env` aparece en `.gitignore` (ya está configurado). Solo `.env.example` debe estar en el repositorio.

---

## 3. Instalar Dokploy en el VPS

Conéctate al VPS por SSH y ejecuta el instalador oficial de Dokploy:

```bash
ssh usuario@IP_DE_TU_VPS
```

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Este script instala Docker, Docker Compose y el panel de Dokploy. El proceso tarda entre 3 y 5 minutos.

Al terminar verás un mensaje similar a:

```
Dokploy installed successfully!
Access the panel at: http://IP_DE_TU_VPS:3000
```

> **Importante:** Anota la URL del panel. Después de configurar el dominio seguirá disponible en esa IP mientras no cambies el puerto.

---

## 4. Acceder al panel de Dokploy

1. Abre el navegador y ve a: `http://IP_DE_TU_VPS:3000`
2. La primera vez que ingresas, Dokploy te pedirá crear una cuenta de administrador.
3. Ingresa tu **correo** y una **contraseña segura** y haz clic en **"Create Account"**.
4. Inicia sesión con esas credenciales.

Verás el dashboard principal de Dokploy con el menú izquierdo.

---

## 5. Conectar GitHub con Dokploy

Para que Dokploy pueda leer tu repositorio necesitas conectar tu cuenta de GitHub.

1. En el menú izquierdo haz clic en **"Settings"** (ícono de engranaje).
2. Ve a la pestaña **"Git Providers"**.
3. Haz clic en **"Add Provider"** → selecciona **"GitHub"**.
4. Te redirigirá a GitHub para autorizar la app de Dokploy.
5. Haz clic en **"Authorize"** y elige si quieres dar acceso a todos los repos o solo el del proyecto.
6. Regresa al panel — verás tu cuenta de GitHub conectada con una palomita verde.

---

## 6. Crear el proyecto en Dokploy

Un **Project** en Dokploy es un contenedor lógico que agrupa todos los servicios de tu app.

1. En el menú izquierdo haz clic en **"Projects"**.
2. Haz clic en el botón **"Create Project"** (esquina superior derecha).
3. Ingresa los siguientes datos:
   - **Name:** `sistema-pedidos`
   - **Description:** `Sistema de Pedidos y Requerimientos` (opcional)
4. Haz clic en **"Create"**.

Serás redirigido a la vista del proyecto vacío donde agregarás los servicios.

---

## 7. Crear el servicio Docker Compose

Dokploy desplegará los 3 contenedores (MySQL + Backend + Frontend) usando el `docker-compose.yml` del repositorio.

1. Dentro del proyecto `sistema-pedidos`, haz clic en **"Add Service"**.
2. Selecciona el tipo **"Docker Compose"**.
3. Se abrirá un formulario. Completa los campos:

### 7.1 Source (origen del código)

| Campo | Valor |
|-------|-------|
| **Provider** | GitHub |
| **Repository** | Selecciona tu repositorio (ej. `tu-usuario/Sistema_Pedidos_Requerimentos`) |
| **Branch** | `main` (o la rama que uses) |

### 7.2 Build & Compose settings

| Campo | Valor |
|-------|-------|
| **Docker Compose Path** | `docker-compose.yml` ← déjalo como está |
| **Build Path** | `/` (raíz del repositorio) |

4. Haz clic en **"Create"** para guardar el servicio Docker Compose.

Dokploy mostrará el servicio recién creado en modo "idle" (no desplegado aún).

---

## 8. Configurar variables de entorno

Este es el paso más importante. Sin las variables correctas el backend no puede conectarse a MySQL ni generar tokens JWT.

1. Dentro del servicio Docker Compose que creaste, haz clic en la pestaña **"Environment"**.
2. Verás un editor de texto (o un formulario de pares clave–valor).
3. Copia y pega el siguiente bloque, **reemplazando los valores marcados con `<TU_VALOR>`**:

```env
# ── MySQL ──────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=<PASSWORD_ROOT_SEGURA>
MYSQL_DATABASE=sistema_pedidos
MYSQL_USER=sispedidos
MYSQL_PASSWORD=<PASSWORD_USUARIO_SEGURA>

# ── Backend ────────────────────────────────────────────
JWT_SECRET=<CADENA_ALEATORIA_32_CHARS>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://<TU_DOMINIO>

# ── Frontend (build arg) ───────────────────────────────
# Dejar en /api porque nginx ya hace el proxy interno
VITE_API_URL=/api
```

### Cómo generar un JWT_SECRET seguro

Puedes crear uno en el terminal del VPS con:

```bash
openssl rand -base64 48
```

Copia la salida y úsala como `JWT_SECRET`.

### Ejemplo de variables completas

```env
MYSQL_ROOT_PASSWORD=R00tP4ss2024!Seguro
MYSQL_DATABASE=sistema_pedidos
MYSQL_USER=sispedidos
MYSQL_PASSWORD=SisP3didos2024!
JWT_SECRET=c4mbi4EsteValorPorUnaClaveAleatoriaLargaMuySegura
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://pedidos.miempresa.com
VITE_API_URL=/api
```

4. Haz clic en **"Save"** para guardar las variables.

> **Nota sobre CORS_ORIGIN:** Si quieres que la API acepte peticiones desde cualquier origen mientras pruebas, usa `CORS_ORIGIN=*`. Para producción usa el dominio exacto.

---

## 9. Asignar dominio y activar HTTPS

### 9.1 Apuntar el DNS al VPS

En el panel de tu proveedor de dominio (Cloudflare, GoDaddy, Namecheap, etc.) crea un registro **A**:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `pedidos` (o `@` para raíz) | `IP_DE_TU_VPS` | Auto |

Si quieres usar un subdominio como `app.midominio.com`:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `app` | `IP_DE_TU_VPS` | Auto |

Espera 1–5 minutos para que el DNS se propague (puedes verificar en https://dnschecker.org).

### 9.2 Configurar el dominio en Dokploy

1. En el servicio Docker Compose, ve a la pestaña **"Domains"**.
2. Haz clic en **"Add Domain"**.
3. Completa el formulario:

| Campo | Valor |
|-------|-------|
| **Domain** | `pedidos.midominio.com` (el que apuntaste) |
| **Port** | `80` (el frontend expone el puerto 80) |
| **HTTPS** | Activar el toggle → Let's Encrypt emitirá el certificado |

4. Haz clic en **"Save"**.

Dokploy configurará automáticamente el reverse-proxy (Traefik) y solicitará el certificado SSL. El proceso toma 1–2 minutos.

---

## 10. Hacer el primer deploy

1. Ve a la pestaña **"Deployments"** del servicio.
2. Haz clic en el botón **"Deploy"** (o **"Redeploy"**).
3. Dokploy ejecutará los pasos:
   - Clonar el repositorio desde GitHub
   - Hacer `docker compose build` (construye las imágenes del backend y frontend)
   - Hacer `docker compose up -d` (levanta los 3 contenedores)

4. Puedes ver los logs en tiempo real haciendo clic en **"View Logs"** dentro del deployment en curso.

El primer build tarda entre 3 y 8 minutos porque descarga las imágenes base (`node:20-alpine`, `nginx:alpine`, `mysql:8.0`) y compila el frontend.

Cuando el estado cambie a ✅ **"Done"** todos los contenedores están corriendo.

---

## 11. Ejecutar el seed (datos iniciales)

El seed crea los usuarios iniciales (admin, aprobador, operador) y las categorías de ejemplo. Se ejecuta **una sola vez** después del primer deploy.

### 11.1 Abrir una terminal del contenedor backend

1. En el panel de Dokploy, dentro del servicio, ve a la pestaña **"Terminal"** (o "Console").
2. Selecciona el contenedor **`sispedidos_backend`**.
3. Se abrirá una terminal interactiva dentro del contenedor.

### 11.2 Ejecutar el seed

```bash
node src/seeders/seed.js
```

Verás la salida:

```
✅ Sequelize connected OK
✅ Modelos sincronizados
👤 Creando usuarios...
📦 Creando categorías...
🏢 Creando proveedores...
✅ Seed completado exitosamente
```

Si no hay pestaña "Terminal" en tu versión de Dokploy, puedes ejecutarlo desde SSH en el VPS:

```bash
ssh usuario@IP_DE_TU_VPS
docker exec -it sispedidos_backend node src/seeders/seed.js
```

### 11.3 Usuarios creados por el seed

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@empresa.com` | `Admin1234!` |
| Aprobador | `aprobador@empresa.com` | `Aprobador1!` |
| Operador | `operador@empresa.com` | `Operador1!` |

> **⚠️ Importante:** Cambia las contraseñas inmediatamente después del primer ingreso.

---

## 12. Verificar que todo funcione

1. Abre el navegador y ve a `https://pedidos.midominio.com`
2. Deberías ver la pantalla de login del sistema.
3. Ingresa con las credenciales del administrador.
4. Verifica en el Dashboard que carguen los KPIs.
5. Ve a **Pedidos** y crea un pedido de prueba.
6. Inicia sesión como aprobador y aprueba el pedido.

### Verificar el backend directamente

```
https://pedidos.midominio.com/api/health
```

Debería responder:

```json
{ "status": "ok" }
```

### Ver logs de cada contenedor

Desde el panel de Dokploy → pestaña **"Logs"** del servicio o desde SSH:

```bash
# Logs del backend
docker logs sispedidos_backend --tail=50 -f

# Logs del frontend (nginx)
docker logs sispedidos_frontend --tail=20

# Logs de MySQL
docker logs sispedidos_mysql --tail=20
```

---

## 13. Actualizar la app (re-deploy)

Cuando hagas cambios en el código y quieras desplegarlos:

1. Haz `git push` a la rama `main` de tu repositorio.
2. En el panel de Dokploy → servicio → pestaña **"Deployments"**.
3. Haz clic en **"Redeploy"**.

Dokploy jalará los últimos cambios, reconstruirá las imágenes y reiniciará los contenedores (con **zero-downtime** si los healthchecks están activos).

### Auto-deploy con webhook (opcional)

Para que Dokploy redeploy automáticamente en cada `git push`:

1. En Dokploy → servicio → pestaña **"General"** → copia la URL del **Webhook**.
2. En GitHub → repositorio → **Settings** → **Webhooks** → **Add webhook**.
3. Pega la URL del webhook y selecciona el evento **"push"**.
4. Guarda. Desde ahora cada `git push` a `main` disparará un redeploy automático.

---

## 14. Solución de problemas comunes

### ❌ El backend no conecta a MySQL

**Síntoma:** Logs dicen `Access denied for user` o `ECONNREFUSED 3306`.

**Solución:**
- Verifica que `MYSQL_USER`, `MYSQL_PASSWORD` en las variables de entorno del Compose coinciden exactamente con los valores usados al crear la DB.
- MySQL tarda ~15 segundos en estar listo. El backend tiene un `healthcheck` dependencia — si falla, espera 30 segundos más y haz Redeploy.

---

### ❌ El frontend muestra pantalla en blanco

**Síntoma:** La página carga pero está vacía, sin la app React.

**Posibles causas:**
1. `VITE_API_URL` incorrecta: debe ser `/api` (relativa).
2. Error de build: ve a **Deployments** → log del build → busca errores en la etapa `npm run build`.

---

### ❌ Las llamadas a la API devuelven 404 o CORS error

**Síntoma:** El navegador muestra errores de red en la consola.

**Solución:**
- Verifica que el `nginx.conf` del frontend proxea `/api/` → `http://backend:3000/api/` (ya está configurado).
- Verifica que `CORS_ORIGIN` en el backend tiene exactamente el mismo dominio que el frontend (incluyendo `https://`).

---

### ❌ El certificado SSL no se genera

**Síntoma:** El navegador muestra "conexión no segura".

**Solución:**
1. Verifica que el registro DNS tipo A apunte a la IP del VPS.
2. Espera 5–10 minutos para propagación DNS.
3. En Dokploy → dominio → haz clic en **"Refresh Certificate"**.
4. Asegúrate de que el puerto 80 y 443 del VPS estén abiertos en el firewall:
   ```bash
   ufw allow 80 && ufw allow 443 && ufw allow 3000
   ```

---

### ❌ Los archivos subidos (uploads) se pierden en el redeploy

**Causa:** Los uploads se guardan dentro del contenedor y se borran al reconstruir.

**Solución:** El `docker-compose.yml` ya define un **volumen** (`backend_uploads`) que persiste entre deploys. Dokploy preserva los volúmenes en los redeployments. Si usas Docker directamente, no hagas `docker compose down -v` (la bandera `-v` borra los volúmenes).

---

## Resumen de arquitectura desplegada

```
Internet
   │
   ▼
Traefik (Dokploy) — HTTPS / Certificado Let's Encrypt
   │
   ▼
┌─────────────────────────────────────────┐
│  Contenedor: sispedidos_frontend        │
│  nginx:alpine — puerto 80               │
│  • Sirve los archivos estáticos de React│
│  • Proxy /api/ → backend:3000           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Contenedor: sispedidos_backend         │
│  node:20-alpine — puerto 3000           │
│  • API REST Express                     │
│  • Sequelize ORM                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Contenedor: sispedidos_mysql           │
│  mysql:8.0 — puerto 3306               │
│  • Base de datos principal              │
│  • Volumen persistente                  │
└─────────────────────────────────────────┘
```

---

## Checklist final

- [ ] VPS con Ubuntu 22.04 y Dokploy instalado
- [ ] Repositorio subido a GitHub con todos los archivos commiteados
- [ ] GitHub conectado a Dokploy en Settings → Git Providers
- [ ] Proyecto `sistema-pedidos` creado en Dokploy
- [ ] Servicio Docker Compose apuntando al repo correcto
- [ ] Variables de entorno configuradas (MySQL + JWT + CORS)
- [ ] DNS tipo A apuntando al VPS
- [ ] Dominio configurado en Dokploy con HTTPS activado
- [ ] Primer deploy exitoso (status ✅ Done)
- [ ] Seed ejecutado: `node src/seeders/seed.js`
- [ ] Login funcionando en `https://tudominio.com`
- [ ] Contraseñas de los usuarios seed cambiadas

---

*Guía generada para el proyecto Sistema_Pedidos_Requerimentos.*
