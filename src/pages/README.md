# Pages

Role-organized page components. The active routing layer lives in
`src/routes/` (TanStack Start file-based routing — required by the
framework and the Lovable preview, so it cannot be moved here).

As pages grow, move their JSX into the matching folder below and have
the route file in `src/routes/` thin out to just `export const Route =
createFileRoute(...)({ component: () => <SomePage /> })`.

```
pages/
  auth/         login, register
  client/       dashboard, create project, track progress, view 3D model,
                customize design, cost estimates, quality inspection,
                safety issues
  contractor/   dashboard, users, projects, budget, blueprints,
                quality, communications
  supervisor/   dashboard, daily progress, daily costs, quality,
                safety, analytics, communication
  shared/       components reused across roles
```
