import { healthResponseSchema, problemSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { bootTestApp, useTestApp } from '../../test/http';

describe('GET /api/health', () => {
  const t = useTestApp();

  it('returns 200 when the database answers', async () => {
    const res = await t.http().get('/api/health').expect(200);

    expect(healthResponseSchema.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('returns a generic 500 problem when the database cannot answer', async () => {
    // Its own app, so closing the database leaves the shared app's lifecycle intact.
    const broken = await bootTestApp();
    try {
      broken.db.$client.close();

      const res = await broken.http().get('/api/health').expect(500);

      expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
      expect(problemSchema.parse(res.body)).toEqual({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      });
    } finally {
      await broken.app.close();
    }
  });
});
