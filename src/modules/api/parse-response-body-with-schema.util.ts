import type z from 'zod';

import { Failure, Success, type Result } from '@modules/error-handling/result.model';

import { BodySchemaMismatchError } from './fetch-api-errors.model';

export function parseResponseBodyWithSchema<TBodyResponse>({
  body,
  schema,
  path,
}: {
  body: unknown;
  path: string;
  schema?: z.ZodSchema<TBodyResponse>;
}): Result<TBodyResponse, BodySchemaMismatchError> {
  if (!schema) return new Success(body as TBodyResponse);

  const result = schema.safeParse(body);
  if (!result.success)
    return new Failure(BodySchemaMismatchError.create({ cause: result.error, path }));
  return new Success(result.data);
}
