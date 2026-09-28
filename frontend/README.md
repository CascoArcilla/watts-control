# Frontend - Watts Control

Aplicación React para el control de consumo eléctrico.

## Stack Tecnológico
- **React 19** — UI library
- **Vite 8** — Build tool & dev server
- **React Router 7** — Routing (SPA)
- **Tailwind CSS 4** — Styling (v4 con @tailwindcss/postcss)
- **Axios** — HTTP client con interceptor auto-refresh de tokens
- **Lucide React** — Iconos
- **ESLint (flat config)** — Linting
- **PostCSS + autoprefixer** — CSS processing
- **pnpm** — Package manager

## Scripts
```bash
pnpm install        # Instalar dependencias
pnpm dev            # Servidor de desarrollo (puerto 5173)
pnpm dev:host       # Servidor de desarrollo accesible en red
pnpm build          # Build de producción (output en dist/)
pnpm lint           # Ejecutar ESLint
pnpm preview        # Preview del build de producción
```

## Estructura
```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas (rutas)
├── context/        # React Context (AuthContext, etc.)
├── hooks/          # Custom hooks
├── utils/          # Utilidades
├── layout/         # Layouts (Sidebar, Header, etc.)
├── App.jsx         # Componente raíz con rutas
└── main.jsx        # Entry point
```

## Variables de entorno
Copia `.env.example` a `.env` y ajusta:

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API backend (ej: `http://localhost:9200`) |

**Nota:** El frontend usa `__VITE_API_URL__` (Vite `define` global), NO `import.meta.env`.

## Autenticación
- JWT en cookies httpOnly (access 15min + refresh 7d)
- Axios interceptor en `AuthContext.jsx` maneja auto-refresh en 401
- CORS configurado con `credentials: true`

## Rutas protegidas
Ver `src/App.jsx` — usa `ProtectedRoute` con verificación de roles (`Administrador`, `Lector`, `Propietario`).