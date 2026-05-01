# Objetivo

Quiero que me ayudes a crear una aplicación web para detalles ver [REQUIREMENTS.md](./REQUIREMENTS.md)

## Base de datos

La base de datos será MySQL, esta db ya esta creada y las credenciales estan en el archivo .env:

- EC_DB_HOST: Host de la base de datos (por defecto localhost)
- EC_DB_PASSWORD: Password de la base de datos (por defecto "12345678")
- EC_DB_NAME: Nombre de la base de datos (por defecto "control_watts")
- EC_DB_PORT: Puerto de la base de datos (por defecto 3306)
- EC_SECRET_KEY_JWT: Secret key para JWT
- REFRESH_SECRET: Refresh token Secret key

## Modelo Entidad Relación

Creados con PlantUML puedes ver el modelo en el archivo [data_base.plantuml](./data_base.plantuml) estos deberan ser creados con Migrations de sequelize-cli para una mejor administracion.

## Requerimientos:

- El proyecto deberá estar organizado en carpetas:
  - backend
  - frontend

- El backend deberá estar organizado en carpetas:
  - routes
  - controllers
  - models
  - middleware
  - config
  - utils

- El frontend deberá estar organizado en carpetas:
  - components
  - pages
  - services
  - utils
