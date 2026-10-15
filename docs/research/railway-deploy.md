# Research: deploying NestJS + React (Vite) + SQLite on Railway

- **Question:** issue #7. What is the simplest reliable way to deploy this app on Railway today, given that SQLite keeps its data in a file?
- **Stack assumed:** pnpm workspaces monorepo (`api/` NestJS, `web/` React + Vite), Node 24 LTS, SQLite through `better-sqlite3` or `node:sqlite`.
- **Researched:** 2026-10-15. Every page below was read that day.
- **Dating facts:** docs.railway.com pages show no dates, so each Railway page is dated by the last commit to its source file in [railwayapp/docs](https://github.com/railwayapp/docs) ("src updated YYYY-MM-DD").
- **Status:** facts only. This is not a decision. Points that need verification or contradict each other are marked **⚠**.

---

## 1. Headline facts (read these first)

1. **Pre-deploy commands run without the volume.** Railway runs them "in a separate container from your application. Changes to the filesystem are not persisted and volumes are not mounted." The docs also say that a command which reads or writes volume data "should instead be done as part of the start command." This means SQLite migrations and the seed **cannot** use the pre-deploy command and must run in the start command. ([Pre-deploy command](https://docs.railway.com/guides/pre-deploy-command), src updated 2026-08-27; repeated in [Volumes guide](https://docs.railway.com/volumes), src updated 2026-05-28.)
2. **A service with a volume always has a short outage on redeploy.** "To prevent data corruption, we prevent multiple deployments from being active and mounted to the same service. This means that there will be a small amount of downtime when re-deploying a service that has a volume attached, even if there is a healthcheck endpoint configured." Two deployments therefore never share the volume, which is what SQLite needs. ([Volumes reference](https://docs.railway.com/reference/volumes), src updated 2026-09-08; [Healthchecks](https://docs.railway.com/reference/healthchecks), src updated 2026-09-03.)
3. **Config as Code (`railway.json` / `railway.toml`) is deprecated, and new services cannot use it.** The docs state: "New services cannot opt into Config as Code. Existing Config as Code files stop being read on **2026-12-01** (hard cutoff)." The replacement is Infrastructure as Code (`.railway/railway.ts`, applied with `railway config plan/apply`), or plain dashboard settings. ([Infrastructure as Code](https://docs.railway.com/infrastructure-as-code), src updated 2026-10-07; deprecation commit "deprecate Config as Code docs (CaC → IaC PR1)" dated 2026-08-21.)
4. **Railpack is the builder, and Nixpacks is in maintenance mode.** Config-as-code lists only `RAILPACK` (default) and `DOCKERFILE` as builder values. The Nixpacks README says: "This project is currently in maintenance mode … We recommend using Railpack." ([Config as Code reference](https://docs.railway.com/reference/config-as-code); [nixpacks README](https://github.com/railwayapp/nixpacks), checked 2026-10-15.)
5. **Volumes can't be combined with replicas, and each service gets one volume.** This is a hard limit for an app that keeps its data in one SQLite file. ([Volumes reference](https://docs.railway.com/reference/volumes).)

---

## 2. One service or two

**What Railway documents**

- Railway has **no page that recommends** one shape over the other for "API + SPA". **⚠** Nothing on the question was found in the docs.
- Railway's [React guide](https://docs.railway.com/guides/react) deploys a Vite SPA as its **own service** served by Caddy.
- Railpack does the same automatically. When it detects Vite (a `vite.config.*` file, or a `build` script containing `vite build`), it serves `dist` with Caddy using a default Caddyfile. SPA mode is turned off by `RAILPACK_NO_SPA=1` or **by setting a custom start command**. ([Railpack Node docs](https://railpack.com/languages/node).)
- The [monorepo guide](https://docs.railway.com/guides/monorepo) describes the two-service pattern for a "shared monorepo": one service per package, each with its own `pnpm --filter <pkg> build/start` commands and watch paths. When you import a JS monorepo through railway.com/new, Railway also **auto-stages one service per deployable package**.

**Serving the SPA from Nest**

- `@nestjs/serve-static` with `ServeStaticModule.forRoot({ rootPath })` serves a built SPA.
- By default, `renderPath` "matches all paths, and the module responds with the `index.html` file", while controller routes still reach Nest.
- With the Fastify adapter you also need `serveStaticOptions.fallthrough: true`.
- The recipe does not document the `exclude` syntax for keeping `/api/*` out of the fallback. **⚠** Check `ServeStaticModuleOptions` for the Nest 11 path syntax when implementing.
- Source: [NestJS docs: Serve static](https://docs.nestjs.com/recipes/serve-static), read 2026-10-15.

**Trade-off from the facts above**

| | One service (Nest serves `web/dist`) | Two services (API + Caddy SPA) |
|---|---|---|
| Origins / CORS | Same origin, so no CORS and no API base URL at build time | Two `*.up.railway.app` domains, so CORS is needed, or a Caddy reverse proxy to the API over the private network |
| Volume | Attached to the one service | Attached to the API service only (one volume per service) |
| Redeploy outage | Any change, UI included, redeploys the volume service (brief downtime) | UI-only changes redeploy just the Caddy service, with no volume and so no forced downtime |
| Cost | One container | Two containers (Caddy is small, but it is a second always-on service) |
| Config | Must override Railpack SPA auto-detection (a custom start command does that) | Railpack defaults fit the `web` service |

---

## 3. Persistence: volumes and SQLite

**How volumes work** ([Volumes guide](https://docs.railway.com/volumes), [Volumes reference](https://docs.railway.com/reference/volumes))

- **Mount path:** you choose it, for example `/data`.
- **Railpack layout:** Railpack puts the app in `/app`. If the app writes to a relative path like `./data`, mount at `/app/data`.
- **Provided variables:** Railway sets `RAILWAY_VOLUME_MOUNT_PATH` and `RAILWAY_VOLUME_NAME` at runtime.
- **When it is mounted:** "Volumes are mounted to your service's container when it is started, not during build time." Data written to the mount path at build time does not persist. The volume is also not mounted during pre-deploy (see §1).
- **Permissions:** volumes are mounted as `root`. Images that run as a non-root user need `RAILWAY_RUN_UID=0`. This matters only for a custom Dockerfile with a `USER`.

**Default size and count by plan**

| Plan | Default volume size | Volumes per project |
|---|---|---|
| Free / Trial | 0.5 GB | Free 1, Trial 3 |
| Hobby | 5 GB | 10 |
| Pro | 50 GB, self-serve up to 1 TB | 20 |

- Live resize (grow only) is available on paid plans.
- A volume that reaches 100% triggers an automatic offline resize, which **restarts** the service.

**Performance and cost**

- I/O: 3,000 read and 3,000 write IOPS on every plan.
- Volume storage price: $0.15 / GB / month ([Plans](https://docs.railway.com/reference/pricing/plans), src updated 2026-09-22).

**Backups and file access** ([Backups](https://docs.railway.com/reference/backups))

- Manual backups, plus Daily (kept 6 days), Weekly (kept 27 days) and Monthly schedules.
- A restore stages a new volume for you to review.
- `railway volume browse` / `railway volume files download|upload` and `sftp`/`scp` through `railway ssh` give direct file access, which is useful for pulling the `.db` file.

**Redeploy behaviour**

- Two deployments never mount the volume at once, so each redeploy has a short gap (§1).
- Without a volume, Railway keeps a "slight overlap for zero downtime", tunable with `RAILWAY_DEPLOYMENT_OVERLAP_SECONDS` ([Deployments reference](https://docs.railway.com/reference/deployments)).
- The old deployment gets SIGTERM, then SIGKILL after the draining time (`RAILWAY_DEPLOYMENT_DRAINING_SECONDS`) ([Deployment teardown](https://docs.railway.com/guides/deployment-teardown)).
- The app should close the SQLite handle on SIGTERM. In Nest that means `app.enableShutdownHooks()` (general Nest practice, not a Railway statement).
- **⚠ Overlap settings:** the docs don't say whether the overlap and draining settings are ignored when a volume is attached. A Railway SQLite template in the marketplace recommends `overlapSeconds: 0`, but that is community content, not the docs. Leaving overlap at 0 costs nothing.

**Is SQLite on a volume supported and safe?**

- Railway's docs have **no SQLite-specific page or statement**. **⚠**
- Single-writer safety follows from the documented constraints: one volume per service, no replicas, and no two active deployments mounting the same volume.
- Community templates in Railway's marketplace (for example "SQLite | Database on a Volume") run SQLite on `/data`. They are not first-party docs.

---

## 4. Building the pnpm monorepo

**Builder choice**

- **Railpack** (default) detects pnpm from `packageManager`, `devEngines.packageManager` or `pnpm-lock.yaml`.
- It supports `pnpm-workspace.yaml` workspaces "with no special configuration", installs all workspace dependencies, and keeps workspace links.
- For one package, define build/start scripts in the root `package.json`, or set the build and start commands on the service.
- Source: [Railpack Node docs](https://railpack.com/languages/node) (Railpack v0.41.0 released 2026-10-13).
- **Dockerfile** is the alternative, with full control. Railway uses a Dockerfile automatically whenever it finds one. In a Dockerfile service, start commands run in exec form, so `$PORT` needs `/bin/sh -c "…"` ([Start command](https://docs.railway.com/guides/start-command)).
- **Nixpacks:** do not use it (§1).

**Root directory**

- For a *shared* monorepo (packages that depend on the workspace root and lockfile), leave the root directory as `/` and target packages with `pnpm --filter`.
- Railway "pulls only files from that directory" when a root directory is set. That would cut off the root lockfile and `pnpm-workspace.yaml`. ([Build configuration](https://docs.railway.com/guides/build-configuration); [Monorepo](https://docs.railway.com/guides/monorepo).)
- Watch paths always match from `/`, even when a root directory is set.

**Node version**

- Railpack picks the version in this order:
  1. `RAILPACK_NODE_VERSION`
  2. `devEngines.runtime`
  3. `engines.node`
  4. `.nvmrc`
  5. `.node-version`
  6. `mise.toml` / `.tool-versions`
  7. default `lts`
- Only maintained LTS lines are "officially supported". Pinning `"engines": { "node": "24.x" }` (or `.nvmrc` = `24`) makes the version explicit.
- **⚠ Monorepo detail:** it is unclear whether Railpack reads `engines` from the root `package.json` only. Put the pin in the root file.

**Railpack runtime environment**

- Railpack sets `NODE_ENV=production` and `CI=true` at runtime.
- It does not prune devDependencies unless `RAILPACK_PRUNE_DEPS=true` is set.

**Native modules: `better-sqlite3`**

- Railpack "supports building native modules and automatically configures `node-gyp`" ([Railpack Node docs](https://railpack.com/languages/node)).
- `better-sqlite3` **v13.0.0** (2026-07-21) moved to N-API:
  - Prebuilt binaries now ship **inside the npm package**, and `prebuild-install` was removed.
  - Linux x64/arm64 (glibc and musl) are covered. Unsupported platforms "compile during install as before".
  - `engines.node` is `>=22`.
  - The current version is v13.0.3 (2026-08-05).
  - Sources: [release notes](https://github.com/WiseLibs/better-sqlite3/releases/tag/v13.0.0), `package.json` on master.
- `better-sqlite3` **v12.x** still downloads prebuilds with an install script. v12.12.0 has a `node-v137-linux-x64` prebuild, and ABI 137 is Node 24.
- **pnpm build-script gate:**
  - Under pnpm 10.26+/11, dependency build scripts are blocked unless they are allowed in `allowBuilds` in `pnpm-workspace.yaml`.
  - `strictDepBuilds` defaults to `true`, so an unreviewed build script **fails the install** with `ERR_PNPM_IGNORED_BUILDS`.
  - pnpm 11 removed `onlyBuiltDependencies`.
  - This matters for `better-sqlite3` v12, and for v13 if it ever has to compile from source. **⚠** Pin the pnpm version (`packageManager`) and commit an `allowBuilds` entry. ([pnpm build settings](https://pnpm.io/settings/build).)

**`node:sqlite` alternative**

- Node 24 docs (v24.22.0) mark `node:sqlite` as **Stability 1.2, release candidate** since v24.15.0. It needs no flag since v22.13.
- It needs no native build at all, which removes the pnpm/node-gyp risk.
- **⚠** The docs page does not say whether it still prints an ExperimentalWarning. ORM and driver support for it (for example Drizzle or Kysely dialects) is a separate check.
- Source: [Node 24 sqlite docs](https://nodejs.org/docs/latest-v24.x/api/sqlite.html).

**Configuration surface for a new service**

- Use dashboard settings, or IaC `service({ source: github(...), build, start, preDeploy, healthcheck, healthcheckTimeout, volumeMounts: { "/data": volume("data", { sizeMB }) } })` ([IaC reference](https://docs.railway.com/infrastructure-as-code/reference)).
- `railway.json` is **not** an option for new services (§1).

---

## 5. First boot: migrations and the one-time seed

**Options compared**

| Mechanism | Volume available? | Fits SQLite? |
|---|---|---|
| Pre-deploy command | **No.** It runs in a separate container, and filesystem changes are discarded | **No** for migrations or seed of a file DB. It suits a networked DB only |
| Start command (`migrate && seed-if-empty && node dist/main`) | Yes, because the volume is mounted when the container starts | **Yes.** Railway explicitly points volume work here |
| One-off command (`railway ssh` into the running service, then run the seed script) | Yes, inside the running container | Works for a manual reseed. It is not automatic on first boot |

**Behaviour of the start-command approach**

- Migrations must be idempotent. Migration tools handle this through their journal table.
- The seed needs a guard, such as "seed only if the employees table is empty" or a marker row or file on the volume, so later deploys do not reseed.
- With a healthcheck configured, the deployment only becomes Active after a 2xx response. The default healthcheck timeout is 300 s, which leaves room for a first-boot seed. ([Healthchecks](https://docs.railway.com/reference/healthchecks).)
- Railpack runs the start command in a shell, so `&&` chains and `$VAR` expansion work ([Start command](https://docs.railway.com/guides/start-command)).

---

## 6. Configuration: env vars, PORT, health checks, public URL

**PORT and host binding**

- Railway **injects `PORT`**, and the app should listen on it. Health checks use the same value.
- If you rely on target ports instead, set `PORT` yourself ([Healthchecks](https://docs.railway.com/reference/healthchecks)).
- Railway's Fastify guide says the host must be `::` for public and private networking ([Fastify guide](https://docs.railway.com/guides/fastify)). For Nest on Express, `app.listen(process.env.PORT)` binds all interfaces by default (Node behaviour). With the Fastify adapter, pass `'::'` explicitly.

**Health checks** ([Healthchecks](https://docs.railway.com/reference/healthchecks))

- Railway calls the configured path until it returns 2xx, and only then marks the deployment Active.
- They run **only at deploy time**, never continuously.
- Requests come from host `healthcheck.railway.app`. Allow that host if the app filters by Host header.
- The timeout is configurable, with a default of 300 s, or through `RAILWAY_HEALTHCHECK_TIMEOUT_SEC`.

**Public URL** ([Working with domains](https://docs.railway.com/networking/domains/working-with-domains))

- Go to Settings → Networking → Public Networking → **Generate Domain** to get `*.up.railway.app`.
- Railway auto-detects the target port when the app listens on one port.
- `RAILWAY_PUBLIC_DOMAIN` exposes the domain to the app ([Variables reference](https://docs.railway.com/reference/variables)).
- IaC does not manage generated domains, only custom ones.

**Edge limits** ([Specs & limits](https://docs.railway.com/networking/public-networking/specs-and-limits))

- HTTPS only, and plain HTTP GET is redirected with a 301.
- HTTP/1.1 and HTTP/2.
- Requests close after 5 minutes with no data.
- Header size up to 32 KB.
- Edge headers include `X-Forwarded-Proto: https` and `X-Request-Start`.

**Env vars**

- Service variables are set in the dashboard or in IaC.
- Railpack sets `NODE_ENV=production` at runtime.
- Suggested app variable: `DATABASE_PATH=/data/app.db`, or derive it from `RAILWAY_VOLUME_MOUNT_PATH`.

---

## 7. Plans, limits and cost for a demo kept up for a few weeks

Sources: [Plans](https://docs.railway.com/reference/pricing/plans) (src updated 2026-09-22) and [Free trial](https://docs.railway.com/reference/pricing/free-trial) (src updated 2026-09-25).

**Plans**

| Plan | Price | Included usage | Per-service max | Volume |
|---|---|---|---|---|
| Trial | $0 | One-time $5, **expires 30 days** after sign-up | 1 GB RAM, shared vCPU, 5 services/project | 0.5 GB |
| Free | $0 | $1 credit/month, no rollover | 0.5 GB RAM, 1 vCPU, 1 replica | 0.5 GB, 1 volume/project |
| Hobby | $5/month | $5 usage included, pay the delta beyond it | 48 GB RAM, 48 vCPU | 5 GB |

**Trial rules**

- When the trial ends (after 30 days or $5), the account reverts to Free.
- Accounts on the "Limited Trial" (GitHub not verified) have restricted outbound network and ports. Verify through railway.com/verify.
- Trial volumes are deleted 30 days after the credits expire, unless you upgrade.

**Usage prices**

- RAM: $10 / GB / month
- CPU: $20 / vCPU / month
- Egress: $0.05 / GB
- Volume: $0.15 / GB / month
- Builds are free.

**Estimate**

- **Assumptions (mine, not from Railway):** one Nest service idling at about 150–250 MB RAM with light CPU, plus a volume of a few MB.
- **Result:** about $1.5–3 / month.
- **What that means per plan:**
  - It fits Hobby's included $5.
  - It probably fits the Trial for up to 30 days.
  - It probably **exceeds** the Free plan's $1/month.
- **⚠** The docs do not say exactly what happens to a running Free-plan service once the $1 is used up. The pricing FAQ only covers accounts that pay with credits: workloads are stopped.

**Spending controls**

- Usage limits (soft email alert plus a hard limit that takes workloads offline) are on the workspace usage page ([Cost control](https://docs.railway.com/pricing/cost-control)).
- **Serverless (app sleeping)** cuts cost by sleeping after 5–10 min of no *outbound* traffic. The first request after sleep has a cold start and "may return a 502" ([Serverless](https://docs.railway.com/reference/app-sleeping)). That conflicts with an "every response under 500 ms" requirement, so leave it off for the demo.

---

## Recommendation

**One Railpack service on the Hobby plan.** Nest serves the built SPA, a single volume is mounted at `/data`, and migrations plus a guarded seed run in the start command. Reasons:

- **One origin.** There is no CORS and no build-time API URL. There is one service to configure and one domain to generate.
- **The volume rules force SQLite onto one container anyway.** That means one volume, no replicas and no overlapping deployments. Adding a second service for the UI only saves the brief redeploy outage on UI-only changes, which doesn't matter for a demo.
- **The start command is the only automatic hook that sees the volume.** Pre-deploy doesn't. So `migrate && seed-if-empty && node api/dist/main` is the documented path, and `railway ssh` is the manual reseed escape hatch.
- **Shape of the setup:**
  - Root directory `/`, with the Node version pinned to 24 in the root `package.json`.
  - Build: `pnpm --filter web build && pnpm --filter api build`, copying or pointing `rootPath` to `web/dist`.
  - Start: a custom command, which also turns off Railpack's Caddy SPA mode.
  - Healthcheck path such as `/api/health`.
  - Configure it through the dashboard or `.railway/railway.ts`, **not** `railway.json`.
- **Hobby costs $5/month** and covers the expected usage. The Trial expires after 30 days, and Free's $1/month and 0.5 GB RAM cap are too tight to rely on.

## Open risks

1. **No first-party statement that SQLite on a volume is supported.** Safety rests on the documented single-mount rules, not on an explicit endorsement. Use WAL mode and close the DB on SIGTERM.
2. **Brief downtime on every redeploy** of the volume service. The docs don't quantify it. It is acceptable for a demo, but a reviewer hitting the URL mid-deploy will see errors.
3. **Native build path.**
   - `better-sqlite3` v13 bundles its prebuilds, but v12 does not.
   - Either way, pnpm's `allowBuilds` / `strictDepBuilds` can fail the install if a build script is not allowed.
   - Switching to `node:sqlite` (RC on Node 24) removes this risk, but ORM support needs checking.
4. **Railpack SPA auto-detection** can turn the service into a Caddy static site if a root `build` script contains `vite build`. A custom start command (or `RAILPACK_NO_SPA=1`) prevents it. Verify in the first build log.
5. **Config surface is changing.** Config as Code is closed to new services and fully stops on 2026-12-01. IaC is the replacement and is new, so expect doc churn.
6. **Plan edge cases.**
   - What happens to Free-plan services when the $1 credit runs out is unclear.
   - Trial accounts that are not GitHub-verified get restricted networking.
   - Volume data is deleted 30 days after the trial expires.
7. **No continuous health monitoring.** Railway checks health only at deploy time. A crash restarts according to the restart policy, but nothing alerts you unless you add uptime monitoring.
8. **Undated docs.** Every Railway fact above comes from undated pages, dated here by their source-repo commits. Re-check the volumes, pre-deploy and pricing pages right before deploying.
