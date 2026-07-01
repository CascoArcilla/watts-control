---
name: db-migrations
description: Use for Sequelize database migration and seeder tasks. Covers running, generating, and rolling back migrations, as well as running seeders. Triggered by keywords like "migration", "migrate", "seed", "db:migrate", "sequelize-cli".
---

# Database Migrations

This project uses **Sequelize 6** with `sequelize-cli`. Run all commands from `backend/`.

## Run pending migrations

```bash
pnpm sequelize-cli db:migrate
```

## Undo last migration

```bash
pnpm sequelize-cli db:migrate:undo
```

## Undo all migrations

```bash
pnpm sequelize-cli db:migrate:undo:all
```

## Generate a new migration

```bash
pnpm sequelize-cli migration:generate --name <descriptive-name>
```

## Run seeders

```bash
pnpm sequelize-cli db:seed:all
```

## Undo seeders

```bash
pnpm sequelize-cli db:seed:undo:all
pnpm sequelize-cli db:seed:undo --seed <seeder-filename>
```

## Notes

- `entrypoint.sh` runs `db:migrate` and `db:seed:all` every container start.
- Config in `backend/config/config.js` reads `EC_DB_*` env vars + `EC_DB_DIALECT` (must be `postgres` or `mysql`).
- All timestamps use UTC (`timezone: '+00:00'`).
