---
name: routing
description: Use for React Router route setup, protected routes, navigation, and layout structure. Triggered by "route", "router", "protected route", "navigation", "Outlet", "Layout", "Navigate", "sidebar".
---

# Frontend Routing

Uses **React Router 7** with `<BrowserRouter>` in `src/App.jsx`.

## Route structure

```
<AuthProvider>
  <BrowserRouter>
    <Routes>
      /login                                  → public
      <ProtectedRoute>                         → any authenticated user
        <Layout>                               → sidebar + header + <Outlet/>
          /consumptions/today/:page?
          /consumptions/history/:page?
          /consumptions/register
          /meters
          <ProtectedRoute allowedRoles={['Administrador']}>   → admin only
            /meters/register
            /admin
            /admin/users
            /admin/users/create
            /admin/meters/:id/permissions
```

## ProtectedRoute component

Used in `src/components/ProtectedRoute.jsx`:

```jsx
// For any authenticated user — no allowedRoles prop
<Route element={<ProtectedRoute />}>
  <Route path="/some-path" element={<SomePage />} />
</Route>

// For admin-only routes
<Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

The component:
- Shows a spinner while auth is loading
- Redirects to `/login` if not authenticated
- Redirects to `/consumptions/today` if authenticated but lacks required role

## Layout

`src/components/Layout.jsx` wraps all authenticated pages:
- `Sidebar` (desktop)
- `MobileNav` (mobile)
- `Header` (desktop)
- `<Outlet />` for nested route content
- Max width container: `max-w-7xl mx-auto`

## Navigation links

Defined in `src/components/nav/navigation.js`. Refer to that file for the link structure.
