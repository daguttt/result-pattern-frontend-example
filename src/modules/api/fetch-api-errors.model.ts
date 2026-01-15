import {
  isHTTPError,
  type HTTPError,
  isTimeoutError,
  type TimeoutError,
} from 'ky';
import type z from 'zod';

import type { AppError } from '@modules/error-handling/app.error';

import { type ErrorResponse } from './base-response.model';

export class KyHttpError implements AppError {
  readonly _tag = 'KyHttpError';
  public readonly httpError: HTTPError<unknown>;

  constructor(httpError: HTTPError<unknown>) {
    this.httpError = httpError;
  }

  static create({ httpError: httpError }: { httpError: HTTPError<unknown> }) {
    return new KyHttpError(httpError);
  }
}

export class KyTimeoutError implements AppError {
  readonly _tag = 'KyTimeoutError';
  public readonly kyTimeoutError: TimeoutError;

  constructor(kyTimeoutError: TimeoutError) {
    this.kyTimeoutError = kyTimeoutError;
  }

  static create({ kyTimeoutError }: { kyTimeoutError: TimeoutError }) {
    return new KyTimeoutError(kyTimeoutError);
  }
}

export class NetworkError implements AppError {
  readonly _tag = 'NetworkError';
  public readonly underlyingError: unknown;

  constructor(underlyingError: unknown) {
    this.underlyingError = underlyingError;
  }

  static create({ underlyingError }: { underlyingError: unknown }) {
    return new NetworkError(underlyingError);
  }
}

export class JsonParseError implements AppError {
  readonly _tag = 'JsonParseError';
}

export class TextParseError implements AppError {
  readonly _tag = 'TextParseError';
}

export class BodySchemaMismatchError implements AppError {
  readonly _tag = 'BodySchemaMismatchError';
  public readonly cause: z.ZodError;
  public readonly path: string;

  constructor(cause: z.ZodError, path: string) {
    this.cause = cause;
    this.path = path;
  }

  static create({ cause, path }: { cause: z.ZodError; path: string }) {
    return new BodySchemaMismatchError(cause, path);
  }
}

export class ApiResponseError implements AppError {
  readonly _tag = 'ApiResponseError';
  public readonly errorResponse: ErrorResponse;

  constructor(errorResponse: ErrorResponse) {
    this.errorResponse = errorResponse;
  }

  static create({
    errorResponse: errorResponse,
  }: {
    errorResponse: ErrorResponse;
  }) {
    return new ApiResponseError(errorResponse);
  }
}

export class ApiUnexpectedError implements AppError {
  readonly _tag = 'ApiUnexpectedError';
  public readonly underlyingError: string;

  constructor(underlyingError: string) {
    this.underlyingError = underlyingError;
  }

  static create({ underlyingError }: { underlyingError: string }) {
    return new ApiUnexpectedError(underlyingError);
  }
}

export type FetchingError = KyHttpError | KyTimeoutError | NetworkError;

export function toFetchingError(e: unknown): FetchingError {
  if (isHTTPError(e)) {
    return KyHttpError.create({ httpError: e });
  }

  if (isTimeoutError(e)) {
    return KyTimeoutError.create({ kyTimeoutError: e });
  }

  return NetworkError.create({ underlyingError: e });
}

export type FetchApiError =
  | ApiResponseError
  | FetchingError
  | BodySchemaMismatchError
  | ApiUnexpectedError;

const FETCH_API_ERROR_CLASSES = [
  KyHttpError,
  KyTimeoutError,
  NetworkError,
  BodySchemaMismatchError,
  ApiResponseError,
  ApiUnexpectedError,
];

export function isFetchApiError(error: unknown): error is FetchApiError {
  return FETCH_API_ERROR_CLASSES.some(
    (ErrorClass) => error instanceof ErrorClass
  );
}
