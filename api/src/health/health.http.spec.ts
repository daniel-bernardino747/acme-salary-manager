import { healthResponseSchema } from '@acme/contract';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { bootTestApp, type TestApp } from '../../test/http';
import { clearEmployees } from '../persistence/clear-employees';

describe('GET /api/health', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await bootTestApp();
  });
  afterAll(() => t.app.close());
  beforeEach(() => clearEmployees(t.db));

  it('returns 200 when the database answers', async () => {
    const res = await t.http().get('/api/health').expect(200);

    expect(healthResponseSchema.parse(res.body)).toEqual({ status: 'ok' });
  });
});
