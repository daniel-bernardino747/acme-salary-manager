import { defineRailway, github, project, service, volume } from 'railway/iac';

// One Railpack service: Nest serves the built SPA, and the SQLite file lives on a volume (#7).
// Apply with `railway config plan` / `railway config apply` from a linked directory. The generated
// `*.up.railway.app` domain is not managed here: generate it in the dashboard.
export default defineRailway(() => {
  const data = volume('data');

  const app = service('app', {
    source: github('daniel-bernardino747/acme-salary-manager', { branch: 'main' }),
    build: { builder: 'RAILPACK', buildCommand: 'pnpm run build' },
    // Migrate, `seed --if-empty`, then serve. Not a pre-deploy step: it runs without the volume.
    // A custom start command also keeps Railpack from serving `web` as a Caddy static site.
    start: 'pnpm start',
    healthcheck: '/api/health',
    // Seconds. The first boot seeds before the server listens.
    healthcheckTimeout: 300,
    env: { DATABASE_PATH: '/data/app.db' },
    volumeMounts: { '/data': data },
  });

  return project('acme-salary-manager', { resources: [app, data] });
});
