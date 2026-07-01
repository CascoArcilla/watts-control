---
name: api-calls
description: Use for making API requests, Axios configuration, the auto-refresh interceptor, and the API base URL. Triggered by "axios", "API", "api call", "VITE_API_URL", "__VITE_API_URL__", "interceptor", "refresh token", "withCredentials".
---

# API Calls

Uses **Axios** configured in `src/context/AuthContext.jsx`.

## Base URL

```js
const API_URL = __VITE_API_URL__ || "";
axios.defaults.baseURL = `${API_URL}/api`;
axios.defaults.withCredentials = true;
```

- `__VITE_API_URL__` is a Vite `define` global set from env `VITE_API_URL` in `vite.config.js`.
- NOT `import.meta.env` — the global is replaced at build time.

## Auth interceptor

A response interceptor handles 401 errors:

```js
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry
        && originalRequest.url !== '/auth/login'
        && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      await axios.post('/auth/refresh');   // refresh cookies set new tokens
      return axios(originalRequest);       // retry original request
    }
    return Promise.reject(error);
  }
);
```

## Pattern for API calls in components

```js
import axios from 'axios';

const fetchData = async () => {
  try {
    const res = await axios.get('/some-endpoint');
    // res.data contains the response body
  } catch (err) {
    // err.response.data.message for error messages
  }
};
```

## Endpoints (relative to `/api`)

| Method | Path | Auth |
|---|---|---|
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public (cookie) |
| POST | `/auth/logout` | public (cookie) |
| GET | `/auth/me` | verifyToken |
| GET | `/users` | admin |
| POST | `/users` | admin |
| GET | `/meters` | any auth |
| POST | `/meters` | admin |
| GET | `/consumptions` | any auth |
| POST | `/consumptions` | any auth |
| GET | `/dashboard/stats` | admin |
