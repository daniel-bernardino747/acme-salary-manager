# Railway

`railway.ts` describes the whole Railway project as code: one Railpack service, `app`, built from
`main`. Nest serves the built SPA, and the SQLite file lives on the `data` volume at `/data`. The
start command runs migrate → `seed --if-empty` → serve, and the healthcheck is `/api/health`. Why
this shape: the research ticket #7.

The `railway` SDK is a root dev dependency (`pnpm install` brings it), and the root `typecheck`
covers this file.

## First deploy

1. On a Railway account on the Hobby plan, create an **empty** project and link this directory to
   it: `railway link`. The file manages the whole project, so an apply deletes any resource it
   doesn't list. Never point it at a project with other services.
2. `railway config plan`, then read it: it should create only `service.app` and `volume.data`.
3. `railway config apply`.
4. In the dashboard, open the service → Settings → Networking → **Generate Domain**. The file
   can't declare a generated `*.up.railway.app` domain.
5. Record the public URL on the spine issue.

## Later changes

Edit `railway.ts`, then `railway config plan` and `railway config apply`. A pushed commit on `main`
redeploys by itself. The volume allows one deployment at a time, so every redeploy has a short
outage.
