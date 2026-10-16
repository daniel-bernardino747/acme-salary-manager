import type { HealthResponse } from '@acme/contract';
import { Controller, Get, Inject } from '@nestjs/common';
import { DB } from '../database.module';
import type { Db } from '../persistence/db';
import { ping } from '../persistence/ping';

@Controller('health')
export class HealthController {
  constructor(@Inject(DB) private readonly db: Db) {}

  @Get()
  check(): HealthResponse {
    ping(this.db);
    return { status: 'ok' };
  }
}
