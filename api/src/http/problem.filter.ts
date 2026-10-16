import { PROBLEM_CONTENT_TYPE, type Problem } from '@acme/contract';
import { STATUS_CODES } from 'node:http';
import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { ValidationFailedException } from './zod-validation.pipe';

/** Turns every error into Problem Details (ADR 0003). A 500 never reveals its cause. */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const problem = toProblem(exception);
    if (problem.status >= 500) {
      this.logger.error(
        exception instanceof Error ? (exception.stack ?? exception.message) : exception,
      );
    }
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(problem.status)
      .type(PROBLEM_CONTENT_TYPE)
      .json(problem);
  }
}

function toProblem(exception: unknown): Problem {
  if (exception instanceof ValidationFailedException) {
    return {
      type: 'about:blank',
      title: 'Validation failed',
      status: 400,
      detail: exception.detail,
      errors: exception.errors,
    };
  }
  if (exception instanceof HttpException && exception.getStatus() < 500) {
    const status = exception.getStatus();
    return {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail: exception.message,
    };
  }
  // A deliberate 5xx keeps its status and anything else is a 500; neither body reveals the cause,
  // which is only logged (ADR 0003, *Validation and errors*).
  const status = exception instanceof HttpException ? exception.getStatus() : 500;
  return {
    type: 'about:blank',
    title: STATUS_CODES[status] ?? 'Error',
    status,
    detail: 'An unexpected error occurred',
  };
}
