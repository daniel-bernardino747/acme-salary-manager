import type { Problem } from '@acme/contract';
import { BadRequestException, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

type ProblemError = NonNullable<Problem['errors']>[number];

/** A request that failed its schema. The problem filter renders it with its `errors`. */
export class ValidationFailedException extends BadRequestException {
  constructor(
    readonly detail: string,
    readonly errors: ProblemError[],
  ) {
    super(detail);
  }
}

const DETAIL: Record<ArgumentMetadata['type'], string> = {
  body: 'Request body is invalid',
  query: 'Query is invalid',
  param: 'Path parameter is invalid',
  custom: 'Request is invalid',
};

/** Parses one handler parameter with a contract schema and hands the handler the parsed value. */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown, metadata: ArgumentMetadata): z.output<T> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    throw new ValidationFailedException(
      DETAIL[metadata.type],
      result.error.issues.map((issue) => ({
        path: issue.path.map((key) => (typeof key === 'symbol' ? String(key) : key)),
        message: issue.message,
      })),
    );
  }
}
