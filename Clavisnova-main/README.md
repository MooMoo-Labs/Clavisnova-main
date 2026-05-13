# Clavisnova Main

This project serves the frontend from `frontend/` and exposes the API through a single Cloudflare Worker in `worker.js`.

## Cloudflare Worker

- Frontend assets: `frontend/`
- API routes:
  - `GET /api/health`
  - `POST /api/registration`
  - `POST /api/requirements`
  - `POST /api/contact`
  - `GET /api/admin/stats`
  - `GET /api/admin/contacts`
  - `GET /api/admin/registrations`
  - `GET /api/admin/requirements`
  - `GET /api/admin/delete/contact/:id`
  - `GET /api/admin/delete/registration/:id`
  - `GET /api/admin/delete/requirement/:id`
  - `GET /api/admin/export/registrations`
  - `GET /api/admin/export/requirements`

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL` (recommended)

## Local / deployment notes

Deploy with Wrangler using `worker.js` as the main entry.
