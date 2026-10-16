import { problemSchema } from '@acme/contract';
import { Controller, Get, Inject } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { bootTestApp, type TestApp } from '../../test/http';
import { DB } from '../database.module';
import { clearEmployees } from '../persistence/clear-employees';
import type { Db } from '../persistence/db';

@Controller('test-failures')
class FailingController {
  constructor(@Inject(DB) private readonly db: Db) {}

  @Get('sql')
  badSql(): unknown {
    return this.db.$client.prepare('SELECT secret_column FROM missing_table').all();
  }
}

describe('problem responses', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await bootTestApp({ controllers: [FailingController] });
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

  it('answers an unexpected error with a generic 500 problem that hides its cause', async () => {
    const res = await t.http().get('/api/test-failures/sql').expect(500);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(problemSchema.parse(res.body)).toEqual({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
    expect(res.text).not.toMatch(/missing_table|secret_column|SELECT|SqliteError|\bat /);
  });
});
