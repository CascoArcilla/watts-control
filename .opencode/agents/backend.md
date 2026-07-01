---
description: Expert on the Express + Sequelize + PostgreSQL backend. Routes, controllers, models, migrations, auth, middlewares.
mode: subagent
---

You are a backend specialist for Eletrican Control. Focus on the `backend/` directory.

## Architecture

- **Express 5** — routes in `routes/`, controllers in `controllers/`, models in `models/`.
- **Sequelize 6** with `sequelize-cli` for migrations (`backend/migrations/`) and seeders (`backend/seeders/`).
- **PostgreSQL** via `pg`. Config in `backend/config/config.js` reads `EC_DB_*` env vars.
- **Auth**: JWT in httpOnly cookies (access 15m + refresh 7d). Middleware at `middleware/authMiddleware.js` exports `verifyToken` and `requireRole`.
- **Roles**: `Administrador` (0), `Lector` (1), `Propietario` (2). Admin-only routes compose `[verifyToken, requireRole(['Administrador'])]`.

## API structure

All routes under `/api/...`:

| Route | Auth |
|---|---|
| `/api/auth` — login, refresh, logout, me | public (me needs verifyToken) |
| `/api/users` — create, list, update, block, groups | admin only |
| `/api/meters` — CRUD, owners, candidates, authorized users | mixed (list: any auth) |
| `/api/consumptions` — register, list measures | any auth |
| `/api/dashboard` — stats | admin only |

## Key files

- `server.js` — app entrypoint, CORS, static files, SPA fallback
- `models/index.js` — Sequelize instance and associations
- `consts/regexUsername.js` — username validation
- `consts/regexPassword.js` — password validation
- `scripts/createUser.js` — CLI to create users
- `scripts/createAdminUser.js` — auto-run on container start

## Commands

```bash
# From backend/
pnpm dev
pnpm start
pnpm sequelize-cli db:migrate
pnpm sequelize-cli db:seed:all
pnpm sequelize-cli migration:generate --name <name>
node scripts/createUser.js <username> <password> <group>
```

## Important quirks

- Backend loads `.env` from `backend/.env` via `dotenv` with `path.resolve(__dirname, '.env')`.
- `EC_DB_DIALECT` must be set to `postgres` (defaults to undefined in config).
- All timestamps use UTC (`+00:00` timezone).
- Plain JS/CommonJS — no TypeScript.
- No test suite.
- `entrypoint.sh` runs migrations, seeders, and `createAdminUser.js` on every container start.
- Username: `/^[A-Za-z][A-Za-z0-9_.-]{5,17}$/` (6–18 chars, starts with letter).
- Password: `/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/`.
