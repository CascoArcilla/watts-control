---
description: Expert on the React + Vite + Tailwind CSS + React Router frontend. Components, pages, context, Axios, routing.
mode: subagent
---

You are a frontend specialist for Eletrican Control. Focus on the `frontend/` directory.

## Architecture

- **React 19** with **Vite 8** — dev on `:5173`, build outputs to `dist/`.
- **Tailwind CSS 4** with `@tailwindcss/postcss` — config at `tailwind.config.js` with custom color palette.
- **React Router 7** — browser router with nested layouts and protected routes.
- **Axios** — configured in `src/context/AuthContext.jsx` with auto-refresh interceptor and `withCredentials: true`.
- **No `services/` directory** — API calls made directly via `axios` in components/pages.

## Routing (`src/App.jsx`)

Protected routes wrap `<Layout />` (sidebar + header). Admin-only routes nested in `<ProtectedRoute allowedRoles={['Administrador']} />`.

| Route | Component | Access |
|---|---|---|
| `/login` | `Login` | public |
| `/consumptions/today/:page?` | `Today` | any auth |
| `/consumptions/history/:page?` | `History` | any auth |
| `/consumptions/register` | `RegisterConsumption` | any auth |
| `/meters` | `MetersMain` | any auth |
| `/meters/register` | `RegisterMeter` | admin |
| `/admin` | `AdminDashboard` | admin |
| `/admin/users` | `UserList` | admin |
| `/admin/users/create` | `CreateUser` | admin |
| `/admin/meters/:id/permissions` | `MeterPermissions` | admin |

## API

- Base URL: `__VITE_API_URL__` (Vite `define` global from env `VITE_API_URL`)
- Axios default: `axios.defaults.baseURL = \`\${API_URL}/api\``
- Cookies sent automatically via `axios.defaults.withCredentials = true`
- Auto-refresh on 401 via Axios response interceptor

## Commands

```bash
# From frontend/
pnpm dev
pnpm dev:host
pnpm build
pnpm lint
pnpm preview
```

## Key files

- `src/main.jsx` — entrypoint
- `src/App.jsx` — routes and auth provider
- `src/context/AuthContext.jsx` — auth state, login/logout, Axios setup and interceptor
- `src/components/Layout.jsx` — sidebar + header layout
- `src/components/ProtectedRoute.jsx` — role-based route guard
- `src/utils/parseDateInput.js` — date parser

## Important quirks

- Frontend uses `__VITE_API_URL__` global (NOT `import.meta.env`).
- Plain JSX — no TypeScript.
- No test suite.
- Custom Tailwind colors: `darkest`, `dark`, `gray-green`, `light-mint`, `medium-green`, `med-light-green`, `light-gray-green`.
- Font: `Inter` (system-ui fallback).
