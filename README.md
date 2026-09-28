# ⚡ Watts Control

## Descripción
Es un proyecto personal para llevar el control del consumo de KW/h y el pago del servicio de luz, está pensado para ser usado por miembros de una familia para administrar el consumo de KW/h de sus medidores de luz. El modelo de entidad relación podrá cambiar a lo largo del desarrollo y por ende algunos aspectos de la aplicación también pueden cambiar.

## Features
- [x] Autenticación (JWT con access + refresh tokens en cookies httpOnly)
- [x] Gestión de medidores (el medidor pertenece a un usuario propietario, puede ser asignado por el admin)
- [x] Gestión de clientes (usuarios)
- [x] Gestión de consumos (el consumo es registrado por el usuario en base a un medidor asociado)
- [x] Generación de facturas (estimadas en base a los consumos registrados)
- [x] Historial de consumos (lista de consumos registrados, filtros por fecha y por medidor)
- [x] Revisar consumo por día según el consumo del día anterior (cálculo basado en la diferencia de los últimos consumos registrados)

## Tecnologías

### Backend
- **Node.js** (v22+)
- **Express 5**
- **Sequelize 6** (ORM)
- **PostgreSQL** (pg, pg-hstore) — esquema `backend_app`
- **JWT** (jsonwebtoken) — access token 15min + refresh token 7d en cookies httpOnly
- **bcryptjs** — hash de contraseñas
- **cookie-parser** — parsing de cookies
- **cors** — CORS con credentials
- **dotenv** — variables de entorno
- **pnpm** — gestor de paquetes
- **sequelize-cli** — migraciones (dev)
- **nodemon** — hot reload (dev)

### Frontend
- **React 19**
- **Vite 8**
- **React Router 7**
- **Tailwind CSS 4** (v4 con @tailwindcss/postcss)
- **Axios** — cliente HTTP con interceptor auto-refresh en 401
- **Lucide React** — iconos
- **ESLint** (flat config)
- **PostCSS** + **autoprefixer**
- **pnpm** — gestor de paquetes

### DevOps
- **Docker** + **Docker Compose** — multi-stage build (backend + frontend en un contenedor)
- **PostgreSQL 16+** — contenedor con healthcheck y script de inicialización de esquema

## Sobre este repositorio
Este repositorio se inició con el prompt [Promt-Inicial.md](./Promt-Inicial.md) indicando que solo genere las primeras vistas, a partir de ahí se fueron agregando o cambiando algunos elementos de la aplicación hasta llegar al estado actual. Se recrearon los modelos con el CLI de Sequelize para generar migraciones y llevar un mejor control de los cambios en la base de datos.

## Como iniciar el proyecto sin docker
Recuerda haber creado los `.env` tanto en `backend` como en `frontend` y haber instalado **PostgreSQL** y **Node.js** en tu sistema. (pnpm como administrador de paquetes)

```bash
cd backend
pnpm install

# Ejecutar migraciones
pnpm sequelize-cli db:migrate

# Iniciar servidor
pnpm dev

# En otra terminal - Iniciar frontend
cd ../frontend
pnpm install
pnpm dev
```

## Como iniciar el proyecto con docker compose
Es necesario crear el `.env` en la raíz del proyecto para que el compose pueda leer las variables de entorno para los servicios. Incluye variables para el backend y frontend. (ejemplo en el archivo `.env.example`) Las migraciones se ejecutan automáticamente en el inicio del contenedor backend.

```bash
docker compose up -d --build
```

**Servicios:**
- `ec-app-api` — Backend Express (puerto 9200)
- `ec-app-frontend` — Frontend Vite (puerto 9300)
- `ec-db-postgres` — PostgreSQL (puerto 9100, schema `backend_app`)

## Crear usuarios
Para crear un usuario para el sistema basta con revisar el script creado `backend/scripts/createUser.js` y seguir los pasos que indica el script. Acá te dejo los comandos necesarios estando en el directorio de backend. (grupo Administrador: 0, Lector: 1, Propietario: 2)

```bash
node scripts/createUser.js <nombre de usuario> <password> <grupo>
```

### Explicación de los parámetros
- `<nombre de usuario>`: Nombre de usuario, debe seguir el regex establecido en `backend/consts/regexUsername.js` (empieza con letra, 6-18 caracteres: letras, números, _, ., -)
- `<password>`: Contraseña, debe seguir el regex en `backend/consts/regexPassword.js` (8-16 chars: mayúscula, minúscula, número, carácter especial @$!%*?&)
- `<grupo>`: Grupo al que pertenece el usuario (0: Administrador, 1: Lector, 2: Propietario)

### Grupos
- `0 - Administrador`: Administra usuarios, medidores y consumos.
- `1 - Lector`: Puede ver y agregar consumos de los medidores que tiene asignados o permitidos.
- `2 - Propietario`: Puede ver y agregar consumos de su medidor asignado así como los permitidos.

También es posible crear un usuario admin rápidamente si se configuran las variables en el archivo `.env` del backend (`EC_SYS_USERNAME`, `EC_SYS_PASSWORD`) y ejecutar `node scripts/createAdminUser.js`.

## Dockerfile
El dockerfile creado en la raíz permite crear una imagen del backend y construyendo el frontend de la aplicación (build). La app de Express sirve la app de React (dist) en un solo contenedor. El dockerfile usa el mismo entrypoint del backend `entrypoint.sh`, que se encarga de hacer las migraciones al iniciar, además de crear el primer usuario administrador si las variables de entorno `EC_SYS_USERNAME` y `EC_SYS_PASSWORD` están definidas.

Se debe tener en cuenta que a la hora de correr el contenedor se deben especificar los puertos a los que se quiere exponer y usar el archivo `.env` para configurar las variables de entorno del backend. También, si desea usar el mismo contenedor de PostgreSQL que se usa en el compose, debe pasar la network creada por docker que se especifica en el compose. Si no se especifica la network, no se podrá comunicar con la base de datos.