# Soup & Juice — Agent Instructions

## Cursor Cloud specific instructions

**Project overview:** French restaurant website (Soup & Juice) with a React/Vite frontend and a Node.js/Express API backend. No database — all data is in-memory.

### Project structure

- `frontend/` — React 19 SPA (Vite 7, HashRouter). Dev server on port **5173**.
- `server/` — Express 5 API (`/api/menu`, `/api/promos`, `/api/stores`, `/api/newsletter/*`). Runs on port **4000**.
- Three separate `package.json` / `package-lock.json` (root, `frontend/`, `server/`). All three need `npm install`.

### Running services

```bash
# Backend (port 4000)
cd server && node server.js &

# Frontend dev server (port 5173, with HMR)
cd frontend && npm run dev
```

The frontend reads `VITE_API_URL` from `frontend/.env.local` (set to `http://localhost:4000` for development).

### Common commands

| Task | Command | Directory |
|------|---------|-----------|
| Lint | `npm run lint` | `frontend/` |
| Build | `npm run build` | `frontend/` (or root) |
| Start backend | `node server.js` | `server/` |
| Start frontend dev | `npm run dev` | `frontend/` |

### Caveats

- `frontend/.npmrc` sets `legacy-peer-deps=true` — required for peer dependency resolution.
- ESLint has pre-existing errors (react-hooks/set-state-in-effect, react-refresh/only-export-components) in the current codebase. These are not blockers.
- The server has no test suite (`npm test` exits with an error stub). Frontend has no test script either. Only ESLint is available for automated checks.
- The frontend uses `HashRouter`, so all routes are prefixed with `#/` (e.g. `http://localhost:5173/#/produits`).
