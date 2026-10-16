import { problemSchema } from '@acme/contract';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { useTestApp } from '../../test/http';
import { ZodValidationPipe } from './zod-validation.pipe';

const echoSchema = z.strictObject({
  name: z.string().trim().min(1),
  annualSalaryMinor: z.int().positive(),
});

@Controller('test-validation')
class EchoController {
  @Post()
  @HttpCode(200)
  echo(@Body(new ZodValidationPipe(echoSchema)) body: z.infer<typeof echoSchema>) {
    return body;
  }
}

describe('ZodValidationPipe', () => {
  const t = useTestApp({ controllers: [EchoController] });

  it('rejects an invalid body with a 400 problem whose errors carry the Zod paths', async () => {
    const res = await t
      .http()
      .post('/api/test-validation')
      .send({ name: '  ', annualSalaryMinor: 0 })
      .expect(400);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    const problem = problemSchema.parse(res.body);
    expect(problem).toMatchObject({
      type: 'about:blank',
      title: 'Validation failed',
      status: 400,
      detail: 'Request body is invalid',
    });
    expect(problem.errors?.map((e) => e.path)).toEqual([['name'], ['annualSalaryMinor']]);
  });

  it('hands the handler the parsed value', async () => {
    const res = await t
      .http()
      .post('/api/test-validation')
      .send({ name: '  Ana Costa ', annualSalaryMinor: 1 })
      .expect(200);

    expect(echoSchema.parse(res.body)).toEqual({ name: 'Ana Costa', annualSalaryMinor: 1 });
  });
});
