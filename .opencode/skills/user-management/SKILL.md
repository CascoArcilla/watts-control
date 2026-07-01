---
name: user-management
description: Use for creating system users via CLI scripts. Covers createUser.js and createAdminUser.js. Triggered by "create user", "createUser", "admin user", "register user", "user script".
---

# User Management

Two CLI scripts in `backend/scripts/` for creating users. Run from `backend/`.

## Create a user with role (CLI)

```bash
node scripts/createUser.js <username> <password> <group>
```

### Groups

| Code | Name | Description |
|---|---|---|
| 0 | Administrador | Full access — manages users, meters, consumptions |
| 1 | Lector | Read-only on assigned meters + can register consumptions |
| 2 | Propietario | Owns a meter — full access to their meter + consumptions |

### Validation

Both username and password must pass regex before the user is created:

- **Username**: `/^[A-Za-z][A-Za-z0-9_.-]{5,17}$/` — starts with letter, 6–18 chars total.
- **Password**: `/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/` — 8–16, at least one uppercase, one lowercase, one digit, one special char (`@$!%*?&`).

## Auto-create admin on container start

If `EC_SYS_USERNAME` and `EC_SYS_PASSWORD` are set in the backend `.env`,
running `node scripts/createAdminUser.js` will create an admin user
(role: `Administrador`). This script is called automatically by `entrypoint.sh`
on every container start.
