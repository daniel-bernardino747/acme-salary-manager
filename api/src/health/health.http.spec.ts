import { healthResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { useTestApp } from '../../test/http';

describe('GET /api/health', () => {
  const t = useTestApp();

  it('returns 200 when the database answers', async () => {
    const res = await t.http().get('/api/health').expect(200);

    expect(healthResponseSchema.parse(res.body)).toEqual({ status: 'ok' });
  });
});
