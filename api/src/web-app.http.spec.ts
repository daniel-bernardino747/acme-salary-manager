import { problemSchema } from '@acme/contract';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { useTestApp } from '../test/http';

// Stands in for the built SPA (ADR 0003, *Endpoints*).
const webRoot = path.join(__dirname, '..', 'test', 'fixtures', 'web');

describe('serving the web app', () => {
  const t = useTestApp({ webRoot });

  it('answers a deep link outside /api with the app', async () => {
    const res = await t.http().get('/pay/outliers').expect(200);

    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toContain('data-fixture="web-app"');
  });

  it('serves the built files the app loads', async () => {
    const res = await t.http().get('/assets/app.js').expect(200);

    expect(res.headers['content-type']).toMatch(/^(text|application)\/javascript/);
    expect(res.text).toContain("export const fixture = 'web-app';");
  });

  it('answers a missing file, such as a stale hashed asset, with a 404 and not the app', async () => {
    const res = await t.http().get('/assets/index-0ld.js').expect(404);

    expect(res.text).not.toContain('data-fixture="web-app"');
  });

  it('still answers an unknown /api route with a JSON 404 problem', async () => {
    const res = await t.http().get('/api/no-such-route').expect(404);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(problemSchema.parse(res.body)).toMatchObject({ status: 404, title: 'Not Found' });
  });
});
