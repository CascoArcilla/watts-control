#!/bin/sh

echo "Ejecutando migraciones de base de datos..."
pnpm sequelize-cli db:migrate

echo "Ejecutando seeders..."
pnpm sequelize-cli db:seed:all

echo "Ejecutando script de creación de usuario..."
node ./scripts/createAdminUser.js

# Start la app
pnpm start