# BuildSync-3D

Smart Construction Management & 3D Visualization System.

## Repository layout

```
site-vision-portal/
├── src/                 # React + TanStack Start frontend (see frontend/README.md)
│   ├── components/      # UI building blocks
│   ├── pages/           # role-organized page components
│   │   ├── auth/  client/  contractor/  supervisor/  shared/
│   ├── layouts/         # shell layouts
│   ├── routes/          # TanStack Start file-based routes
│   ├── hooks/  services/  contexts/  lib/  assets/  types/  utils/
│
├── frontend/            # docs-only mirror; real source is ../src/
│
├── backend/             # Node.js + Express + MySQL API
│   ├── src/
│   │   ├── config/  controllers/  services/  repositories/
│   │   ├── middleware/  routes/  models/  validators/  utils/
│   │   ├── uploads/{blueprints,progress-images,models}/
│   │   └── server.js
│   └── package.json
│
├── opencv-service/      # one-shot Python OpenCV pipeline
│   ├── blueprint_parser.py     # entrypoint
│   ├── wall_detection.py
│   ├── room_detection.py
│   ├── model_generator.py
│   ├── requirements.txt
│   └── output/
│
├── database/            # canonical SQL
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── docs/
│   ├── proposal/  diagrams/  api/  reports/
│
├── docker-compose.yml
├── package.json         # root: frontend build (Lovable runs this)
└── README.md
```

## Why `src/` is at the repo root, not under `frontend/`

The frontend is **TanStack Start**, whose Vite plugin requires the
route tree at `<repo-root>/src/routes/`. The Lovable preview sandbox
also expects that exact layout. Moving the source into
`frontend/src/` breaks both. `frontend/` exists as a placeholder so
the repository structure matches the team architecture diagram, with
the real frontend code at `src/`.

## Run locally

### 1. Frontend (Lovable preview or local dev)

```bash
bun install
bun run dev
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit DB creds + JWT_SECRET
npm install
npm run dev            # http://localhost:4000
```

### 3. Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 4. OpenCV service

```bash
cd opencv-service
pip install -r requirements.txt
# Invoked automatically by the backend on blueprint upload, or:
python3 blueprint_parser.py path/to/blueprint.png
```

### 5. All-in-one (Docker)

```bash
docker compose up --build
```

## Switching the frontend to the real backend

In `.env` at the repo root:

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCK=false
```

With `VITE_USE_MOCK=true` (default) the frontend keeps using the
in-memory mock store in `src/lib/store.tsx`, so the Lovable preview
works without a running backend.
