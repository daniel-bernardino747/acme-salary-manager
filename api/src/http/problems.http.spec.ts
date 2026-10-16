import { problemSchema } from '@acme/contract';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { bootTestApp, type TestApp } from '../../test/http';
import { clearEmployees } from '../persistence/clear-employees';

describe('problem responses', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await bootTestApp();
  });
  afterAll(() => t.app.close());
  beforeEach(() => clearEmployees(t.db));

  it('answers an unknown /api route with a JSON 404 problem', async () => {
    const res = await t.http().get('/api/no-such-route').expect(404);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(problemSchema.parse(res.body)).toMatchObject({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });
});
