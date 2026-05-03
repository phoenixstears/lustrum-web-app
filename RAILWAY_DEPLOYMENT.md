# Railway Production Deployment

This project is a monorepo with separate frontend and backend apps. Deploy them as two Railway services from the same GitHub repo.

## 1) Create Railway Services

1. Connect this repo in Railway.
2. Create service A from `backend/`.
3. Create service B from `frontend/`.
4. Add a PostgreSQL plugin in Railway.
5. Attach the PostgreSQL `DATABASE_URL` variable to backend service.

## 2) Backend Service Settings

- Root directory: `backend`
- Build command: `npm ci ; npm run build`
- Start command: `npm run start`

Required environment variables:

- `DATABASE_URL` (from Railway PostgreSQL)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `FRONTEND_URL`
- `PORT` (Railway provides this automatically)

For `DISCORD_REDIRECT_URI`, use:

- `https://<your-backend-domain>/api/auth/discord/callback`

For `FRONTEND_URL`, use:

- `https://<your-frontend-domain>`

## 3) Frontend Service Settings

- Root directory: `frontend`
- Build command: `npm ci ; npm run build`
- Start command: `npm run start`

Required environment variables:

- `VITE_API_URL=https://<your-backend-domain>`
- `VITE_ADMIN_IDS` (optional, comma-separated)

Important: `VITE_API_URL` is embedded at build time. Redeploy frontend after changing it.

## 4) Discord Developer Portal Setup

In your Discord app OAuth2 settings, add production redirect URI:

- `https://<your-backend-domain>/api/auth/discord/callback`

Keep the local URI too if you still develop locally:

- `http://localhost:5000/api/auth/discord/callback`

## 5) Verify Deployment

1. Open frontend URL and ensure tournaments load.
2. Start Discord login from home page and register page.
3. Complete OAuth callback and verify redirect returns to frontend.
4. Confirm backend `/api` responds and DB queries work.

## Notes

- Backend reads `PORT` from environment and is Railway compatible.
- Frontend serves static build using `serve` on Railway `PORT`.
- Frontend API/auth endpoints now use `VITE_API_URL` instead of hardcoded localhost.
