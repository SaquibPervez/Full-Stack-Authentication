# Auth Monorepo (React + Node/Express)

A full-stack authentication template with cookie-based sessions, automatic access token refresh on the backend, and a modern React frontend (Vite + React Query + React Router + Tailwind-ready).

## Tech Stack
- Frontend: React, Vite, React Router, @tanstack/react-query, axios, react-hot-toast
- Backend: Node.js, Express, cookie-parser, cors, dotenv, bcryptjs, jsonwebtoken

## Repository Structure
- Frontend/
  - src/
    - apis/axios.jsx
    - context/AuthContext.jsx
    - components/ProtectedRoute.jsx
    - pages/Login.jsx, Dashboard.jsx
    - App.jsx, main.jsx
  - vite.config.js (dev proxy for `/api`)
- Backend/
  - index.js (Express server + CORS + routes + cookies)
  - routes/authRoutes.js, dashboard.js
  - controllers/authController.js
  - middleware/authMiddleware.js, validate.js
  - utils/jwtHelpers.js
  - Models/userModel.js
  - .gitignore (ignores .env)

## Auth Model (Cookie-Based)
- Access Token: JWT (expires in 2 minutes), set as HttpOnly cookie `accessToken` on login.
- Refresh Token: JWT (expires in 7 days), set as HttpOnly cookie `refreshToken` on login.
- Auto-Refresh: The backend `authenticateToken` middleware verifies `accessToken`; if missing/expired, it verifies `refreshToken`, mints a new `accessToken` cookie, and continues. The client does NOT call a refresh endpoint during normal flow.
- Frontend Headers: axios attaches `Authorization: Bearer <token>` only when an in-memory token is present; cookie-based auth works without headers.

## Frontend Highlights
- `AuthContext.jsx`
  - Login: posts to `/auth/login`. If the server returns a 200 with `{ error }`, it throws so UI shows the correct toast.
  - Session Restore: reads a minimal `auth_user` hint from cookies on reload (no refresh API).
  - Logout: posts to `/auth/logout`, then clears hint cookies.
- `ProtectedRoute.jsx`: blocks access until `loading` completes; redirects unauthenticated users to `/`.
- `Login.jsx`: redirects authenticated users away from `/` to `/dashboard`; uses React Query mutation with robust error toasts.
- `Dashboard.jsx`: fetches `/dashboard/stats` via React Query; relies on backend middleware for token refresh.
- `axios.jsx`:
  - Base URL: `/api` in dev via Vite proxy; `withCredentials: true` enabled.
  - 401 Handling: On non-auth endpoints, retries once and lets backend middleware refresh; skips retry for `/auth/*` to avoid double-submit.
  - Logging: Console logs when 401 occurs and when a retry happens.

## Backend Highlights
- `authController.js`
  - Login: validates credentials; sets HttpOnly `refreshToken` (7d) and `accessToken` (2m) cookies; returns `{ message, accessToken, user }` (user minimal payload).
  - Register: 201 on success; 409 when email exists; 500 on errors.
  - Logout: clears `refreshToken` (and you can extend to clear `accessToken`).
- `authMiddleware.js`: reads `accessToken` cookie (or header); if invalid, uses `refreshToken` cookie to mint a new `accessToken` cookie and proceeds; otherwise returns 401.
- `validate.js`: returns 400 for schema validation errors.
- `jwtHelpers.js`: token generators + optional `/auth/refresh-token` util (not needed in normal flow).

## Environment Variables (Backend)
Create `Backend/.env` (ignored by git):
```
PORT=5000
ACCESS_TOKEN_SECRET=replace_with_strong_secret
REFRESH_TOKEN_SECRET=replace_with_strong_secret
Base_URL=http://localhost:5173
```
Notes:
- Keep secrets strong and unique across environments.
- In production, set `secure: true` on cookies and ensure HTTPS.

## Development Setup
```
# Backend
cd Backend
npm install
node index.js

# Frontend
cd ../Frontend
npm install
npm run dev
```
- Vite dev server proxies `/api` to `http://localhost:5000` so cookies are same-site in development.

## Common Flows
- Login: success toast → navigate `/dashboard` → backend sets cookies.
- Reload: frontend restores `auth_user` hint; first protected call works; if access token expired, backend auto-refreshes.
- Invalid Credentials: backend returns 401; UI shows error toast; no retry.

## Security Notes & Improvements
- CSRF Protection: Add a CSRF cookie and require an `X-CSRF-Token` header on state-changing routes; validate server-side.
- HttpOnly Tokens: Keep tokens in HttpOnly cookies; avoid storing tokens in JS storage to reduce XSS risk.
- Minimal Client State: Store only non-sensitive user hints client-side; prefer server verification (e.g., `/auth/me`) for sensitive data.
- Cookie Settings: Use `SameSite=Lax` (or `Strict` when possible) and `Secure` in production. Consider setting cookie `domain`/`path` explicitly.
- Rate Limiting & Brute Force: Add rate limiting to `/auth/login` and captcha if needed.
- Password Policy: Strengthen password validation (e.g., complexity requirements) and add bcrypt salt rounds according to performance/security requirements.

## Troubleshooting
- 401 on first dashboard call after reload: expected if access token expired; backend auto-refreshes and retry succeeds.
- CORS/Cookies: Ensure `Base_URL` matches the frontend origin; use Vite proxy in dev; enable `credentials: true` in CORS.
- Double login calls: axios interceptor skips retry for `/auth/*`; ensure this change is present.

## Future Enhancements
- `/auth/me` endpoint to load trusted user profile after reload.
- CSRF middleware.
- Structured error responses with consistent `{ error, code }` schema.
- E2E tests for auth flows.
