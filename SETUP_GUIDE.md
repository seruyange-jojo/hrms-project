# Setup Guide

Last updated: 2025-11-03

This guide explains how to run the backend and frontend for local development.

## Prerequisites

- Docker and Docker Compose

- Node.js (14+ recommended) and npm

- Go (for local backend development without Docker, optional)

## Start backend with Docker Compose

## Quick start (development)

From the repository root, open a terminal and go to `backend`.

1. Start backend and Postgres (from repo root):

```bash
cd backend
docker-compose up --build -d
```

1. Start frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (default [http://localhost:5173](http://localhost:5173)).

## Important files & links

- `backend/` — Go API (controllers, models, routes)
- `frontend/` — React app (components, pages, services)
- `docs/API.md`, `openapi.yaml` — API documentation
- `SDD.md`, `SRS.md`, `SETUP_GUIDE.md` — system & setup docs

## Dev notes

- Backend config: see `backend/config/config.go` for env keys.
- Frontend: set `VITE_API_BASE_URL` to the backend API URL in development.

## Next steps

- Add automated tests and CI
- Diagrams are embedded in `SDD.md` (inlined PlantUML/ASCII snippets)
- Implement server-side payslip generation (planned)

---

Next steps: fix remaining markdown-lint warnings across docs and (optionally) render diagrams for PNG export after the lint pass.

## Getting help

1. Check service status: `docker compose ps`
1. View logs: `docker compose logs -f backend`
1. Verify configuration: check `.env` files
1. Test API directly: use curl or Postman
1. Restart services: `docker compose restart`

---

Happy coding! 🎉