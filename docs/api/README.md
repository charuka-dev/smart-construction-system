# API Reference

Document each backend endpoint group in its own markdown file as the
API stabilizes:

- `auth.md` — POST /auth/login, /auth/register, GET /auth/me
- `projects.md` — CRUD on /projects, plus /projects/:id/blueprint
  and /projects/:id/model
- `expenses.md`, `progress.md`, `messages.md`, `users.md`, ...

Each file should list: method, path, auth requirement, request body,
response shape, and example.
