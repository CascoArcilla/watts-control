# ⚡ Watts Control

## Descripción
Es un proyecto personal para llevar el control del consumo de KW/h y el pago del servicio de luz, está pensado para ser usado por miembros de una familia para administrar el consumo de KW/h de sus medidores de luz. El modelo de entidad relacion podra cambiar a lo largo del desarrollo y por ende algunos aspectos de la aplicación tambien pueden cambiar.

## Features
- [x] Autenticación
- [x] Gestión de medidores (el medidor pertenece a un usuario propietario, puede ser seleccionado por el admin)
- [x] Gestión de clientes (usuarios)
- [x] Gestión de consumos (el consumo es registrado por el usuario en base a un medidor asociado)
- [x] Generación de facturas (estimadas en base a los consumos registrados)
- [x] Historial de consumos (lista de consumos registrados, filtros por fecha y por medidor)
- [x] Revisar consumo por día segun el consumo del día anterior (tiene que ser un cálculo basado en la diferencia de los últimos consumos registrados)

## Tecnologías
- Node.js
- Express.js
- Tailwind CSS
- MySQL
- JWT (con refresh tokens)
- React con Vite

## Sobre este repositorio
Este repositorio se inicio con el prompt [Promt-Inicial.md](./Promt-Inicial.md) indicando que solo genere las primeras vistas, a partir de ahí se fueron agregando o cambiando algunos elementos de la aplicación hasta llegar al estado actual. Se recrearon los modelos con el CLI de Sequelize para generar migraciones y llevar un mejor control de los cambios en la base de datos.

## Como iniciar el proyecto sin docker
Recuerda haber creado los .env tanto en backend como en frontend y haber instalado mysql y nodejs en tu sistema. (pnpm como administrador de paquetes)

```bash
cd backend
pnpm install

# Ejecutar migraciones
pnpm sequelize-cli db:migrate
pnpm sequelize-cli db:seed:all

# Iniciar servidor
pnpm dev

# Iniciar frontend
cd ..
cd frontend
pnpm install
pnpm dev
```

## Como iniciar el proyecto con docker compose
Es necesario crear el .env en la raíz del proyecto para que el compose pueda leer las variables de entorno para los servicios. Incluye variables para el backend y frontend. (ejemplo en el archivo .env.example) Las migraciones y seed se ejecutan automaticamente en el inicio. Tener muy en cuenta que este compose esta configurado para desarrollo, por eso el service de front con vite, no se ejecuta el build de la app de react.

```bash
docker compose up -d --build
```

## Crear usuarios
Para crear un usuario para el sistema basta con revisar el script creado `backend/scripts/createUser.js` y seguir los pasos que indica el script. Aca te dejo los comandos necesarios estando en el direcotrio de backend. (grupo Administrador(admin): 0, grupo Lector: 1, grupo Propietario:2) 

```bash
node scripts/createUser.js <nomre de usuario> <password> <grupo>
```

### Explicación de los parámetros
- `<nomre de usuario>`: Nombre de usuario, debe seguir el regex establecido en el archivo `backend/consts/regexUsername.js`
- `<password>`: Contraseña, debe seguir el regex establecido en el archivo `backend/consts/regexPassword.js`
- `<grupo>`: Grupo al que pertenece el usuario (0: Administrador, 1: Lector, 2: Propietario)

### Grupos
- `0 - Administrador`: Administra usuarios, medidores y consumos.
- `1 - Lector`: Puede ver y agregar consumos de los medidores que tiene asignados o permitidos.
- `2 - Propietario`: Puede ser usado para ser cargo del servicio de luz. Puede ver y agregar consumos de su medidor asignado asi como los permitidos

Tambien es posible crear un usuario admin rapidamente si se configuran las variables en el archivo `.env` del backend (EC_SYS_USERNAME, EC_SYS_PASSWORD) y ejecutar `node scripts/createAdminUser.js`.