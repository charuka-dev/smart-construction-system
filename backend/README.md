# BuildSync-3D Backend

Node.js + Express REST API backed by MySQL, with a Python/OpenCV pipeline that
converts uploaded blueprint images into 3D room polygons for the React viewer.

```
React frontend (Vite)  →  Node/Express API  →  MySQL
                                            →  OpenCV (python subprocess)
                                            →  File storage (local disk)
```

The CV pipeline isn't a persistent service. It's a Python script that the
backend invokes as a one-off subprocess only when a blueprint is uploaded
(synchronous call-and-wait on stdout). No queue, no microservice.

---

## Prerequisites

- Node.js 18+
- MySQL 8+
- Python 3.9+ (optional — set `CV_MOCK=true` to skip)

## Setup

```bash
cd backend
cp .env.example .env          # fill in DB_*, JWT_SECRET
npm install

# Database
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql

# OpenCV deps (skip if using CV_MOCK=true)
pip install -r cv/requirements.txt

npm run dev                   # http://localhost:4000
```

## Demo credentials

All demo accounts use password **`demo`**:

| Email                   | Role        |
| ----------------------- | ----------- |
| contractor@demo.com     | contractor  |
| supervisor@demo.com     | supervisor  |
| client@demo.com         | client      |

If the seeded hash doesn't work in your MySQL build, register a fresh user via
`POST /api/auth/register`.

## REST surface

All routes are prefixed with `/api`. JWT goes in `Authorization: Bearer ...`.

| Method | Path                                | Notes                       |
| ------ | ----------------------------------- | --------------------------- |
| POST   | `/auth/register`                    | public                      |
| POST   | `/auth/login`                       | public                      |
| GET    | `/auth/me`                          |                             |
| GET    | `/users`                            | contractor only             |
| POST   | `/users`                            | contractor only             |
| PATCH  | `/users/:id`                        | contractor only             |
| DELETE | `/users/:id`                        | contractor only             |
| GET    | `/projects`                         | scoped by role              |
| GET    | `/projects/:id`                     |                             |
| POST   | `/projects`                         | contractor                  |
| PATCH  | `/projects/:id`                     | contractor                  |
| DELETE | `/projects/:id`                     | contractor                  |
| GET    | `/projects/:id/milestones`          |                             |
| POST   | `/projects/:id/milestones`          | contractor / supervisor     |
| PATCH  | `/projects/:id/milestones/:mid`     | contractor / supervisor     |
| GET    | `/projects/:id/expenses`            | returns items + total       |
| POST   | `/projects/:id/expenses`            | contractor / supervisor     |
| GET    | `/projects/:id/progress`            | logs + photos               |
| POST   | `/projects/:id/progress`            | multipart, field `photos[]` |
| GET    | `/projects/:id/messages`            |                             |
| POST   | `/projects/:id/messages`            |                             |
| GET    | `/projects/:id/model`               | latest 3D model             |
| POST   | `/projects/:id/blueprint`           | multipart, field `blueprint` — runs OpenCV, persists model |

## Connecting the frontend

In the React project (one level up from this folder), set:

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCK=false
```

`src/lib/api.ts` reads these and attaches the JWT from `localStorage`.
Leaving `VITE_USE_MOCK=true` keeps the in-memory store the Lovable preview
ships with, so the preview still works without a backend running.

## Deploying

This backend is a plain Express app. Anywhere that can run Node + MySQL +
Python (a VM, Docker, Fly.io, Render, etc.) will work. Lovable's hosted
preview cannot run this server — you deploy it yourself.

`uploads/` is local disk by default. `services/cv.service.js` and the
multer setup in `routes/*` are isolated so swapping to S3 is a single
service swap.
