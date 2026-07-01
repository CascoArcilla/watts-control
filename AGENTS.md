# Eletrican-Control - AGENTS.md

## Quick start

```bash
# Backend dev (requires MySQL | PostgreSQL running)
cd backend
pnpm install
pnpm sequelize-cli db:migrate
pnpm sequelize-cli db:seed:all
pnpm dev

# Frontend dev (separate terminal)
cd frontend
pnpm install
pnpm dev # Vite on :5173

# Full stack with Docker
docker compose up -d --build   # backend :9200, frontend :9300, MySQL :9100

# Create admin user (after backend is running)
cd backend
node scripts/createUser.js <username> <password> 0
```

## Architecture

- **Monorepo** with `backend/` (Express 5 + Sequelize 6 + MySQL) and `frontend/` (React 19 + Vite 8 + Tailwind CSS 4 + React Router 7).
- **Package manager: pnpm** (not npm). Lockfiles are `pnpm-lock.yaml`.
- **Auth**: JWT in httpOnly cookies. Access token (15m) + refresh token (7d). Axios interceptor auto-refreshes on 401. CORS with credentials.
- **Roles**: `Administrador` (0), `Lector` (1), `Propietario` (2). Admin-only routes use `requireRole(['Administrador'])`.
- **API base**: all routes under `/api/...`. Health check at `GET /api/health`.
- **Frontend uses `__VITE_API_URL__`** (a Vite `define` global, read from env var `VITE_API_URL`) — NOT `import.meta.env`.
- **Production build**: Dockerfile multi-stage — builds React dist, copies into Express container. Single container serves both API and SPA.
- **DB migrations/seeders** auto-run on container start via `entrypoint.sh`.

## Key env vars

| Variable | Purpose |
|---|---|
| `EC_DB_*` | MySQL connection (host, port, user, password, name) |
| `EC_SECRET_KEY` | JWT access token secret |
| `REFRESH_SECRET` | JWT refresh token secret |
| `EC_REACT_APP` | CORS origin (e.g. `http://localhost:5173` or `http://localhost:9300`) |
| `VITE_API_URL` | Frontend API base URL (e.g. `http://localhost:9200`) |
| `EC_SYS_USERNAME` / `EC_SYS_PASSWORD` | Auto-create admin on container start |

## User validation constraints

- **Username**: `/^[A-Za-z][A-Za-z0-9_.-]{5,17}$/` — starts with letter, 6–18 chars.
- **Password**: `/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/` — 8–16, upper, lower, digit, special.

## Testing

No test suite configured. `pnpm test` in backend echoes an error.

## Lint (frontend only)

```bash
cd frontend && pnpm lint     # ESLint flat config
```

## Important quirks

- Backend `.env` is at `backend/.env` and loaded via `dotenv` with `path.resolve(__dirname, '.env')`. Root `.env` is only for docker compose.
- `entrypoint.sh` runs migrations, seeders, and `createAdminUser.js` on every container start.
- Frontend has no `services/` directory — API calls use `axios` directly (configured in `AuthContext.jsx`).
- `EC_DB_DIALECT` must be set to `mysql` (defaults to undefined in `config/config.js`).
- All timestamps use UTC timezone (`+00:00`).
- No TypeScript — plain JS/JSX throughout.
