import ky, { type Options } from 'ky';
import type z from 'zod';
import { Failure, type Result } from '@modules/error-handling/result.model';
import { tryCatchAsync } from '@modules/error-handling/try-catch.util';

import type {
  BaseRequestBody,
  PaginatedRequestBody,
} from './base-request.model';
import {
  adaptToErrorResponse,
  ApiBaseResponseSchema,
  type ApiBaseResponse,
} from './base-response.model';
import {
  ApiResponseError,
  ApiUnexpectedError,
  BodySchemaMismatchError,
  JsonParseError,
  TextParseError,
  toFetchingError,
  type FetchApiError,
  type KyHttpError,
} from './fetch-api-errors.model';
import { parseResponseBodyWithSchema } from './parse-response-body-with-schema.util';
import { ENV } from '@modules/env-vars/env.constant';

const MOCKED_API_URL =
  'https://mocked-marcacion-api.daguttt.workers.dev/marcacion-pop';

function createKyInstance(
  { baseUrl }: { baseUrl?: string } = {
    baseUrl: MOCKED_API_URL,
  }
) {
  const api = ky.create({
    prefixUrl: baseUrl,
    hooks: {
      beforeRequest: [
        (request) => {
          const sessionStorageToken = sessionStorage.getItem('MFETOKEN');
          const devToken =
            ENV.ENV_NAME === 'dev' && ENV.DEV_MFETOKEN
              ? ENV.DEV_MFETOKEN
              : null;
          const token = sessionStorageToken ?? devToken;
          if (token) request.headers.set('Authorization', `Bearer ${token}`);
        },
      ],
    },
  });

  return api;
}

type KyOptions = Omit<Options, 'body' | 'json'>;

interface FetchApiParams<TBodyResponse, TData> {
  path: string;
  requestBody?: BaseRequestBody<TData> | PaginatedRequestBody<TData>;
  options?: KyOptions;
  schema?: z.ZodSchema<TBodyResponse>;
  /**
   * @default ApiBaseResponseSchema
   */
  errorSchema?: z.ZodSchema<ApiBaseResponse>;
  /**
   * This is meant to be used to override the API_URL environment
   * variable for the legal bins screen endpoints since these are
   * already implemented in the actual backend API.
   *
   * This will be deprecated once all endpoints are implemented.
   */
  baseUrl?: string;
}
export async function fetchApi<TBodyResponse, TData>({
  path,
  requestBody,
  options,
  schema,
  errorSchema = ApiBaseResponseSchema,
  baseUrl = MOCKED_API_URL,
}: FetchApiParams<TBodyResponse, TData>): Promise<
  Result<TBodyResponse, FetchApiError>
> {
  const api = createKyInstance({ baseUrl });

  const optionsWithBody: Options = {
    ...options,
    json: requestBody,
  };

  const fetchingResult = await tryCatchAsync(
    () => api(path, optionsWithBody).json(),
    toFetchingError
  );

  const isKyHttpError =
    fetchingResult.isFailure() && fetchingResult.error._tag === 'KyHttpError';

  const notJsonContentType =
    isKyHttpError &&
    !fetchingResult.error.httpError.response.headers
      .get('Content-Type')
      ?.includes('application/json');
  const isApiUnexpectedError = isKyHttpError && notJsonContentType;
  if (isApiUnexpectedError) {
    const kyHttpError = fetchingResult.error;

    const extractedTextResult = await tryCatchAsync(
      () => kyHttpError.httpError.response.text(),
      () => new TextParseError()
    );
    const extractedText = extractedTextResult.isFailure()
      ? ''
      : extractedTextResult.value;

    const apiUnexpectedError = ApiUnexpectedError.create({
      underlyingError: extractedText,
    });
    return new Failure(apiUnexpectedError);
  }

  const shouldParseErrorResponse = isKyHttpError;
  if (shouldParseErrorResponse) {
    const kyHttpError = fetchingResult.error;

    const parsedErrorResponseResult = await parseErrorResponse({
      errorSchema,
      kyHttpError,
      path,
    });

    if (parsedErrorResponseResult.isFailure())
      return new Failure(parsedErrorResponseResult.error);

    const apiErrorResponse = parsedErrorResponseResult.value;
    return new Failure(
      ApiResponseError.create({
        errorResponse: adaptToErrorResponse(apiErrorResponse),
      })
    );
  }

  if (fetchingResult.isFailure()) return new Failure(fetchingResult.error);

  const body = fetchingResult.value;
  return parseResponseBodyWithSchema({ body, schema, path });
}

async function parseErrorResponse({
  errorSchema,
  kyHttpError,
  path,
}: {
  errorSchema: z.ZodSchema<ApiBaseResponse>;
  kyHttpError: KyHttpError;
  path: string;
}): Promise<Result<ApiBaseResponse, BodySchemaMismatchError>> {
  const response = kyHttpError.httpError.response;
  const extractedResponseBodyResult = await tryCatchAsync(
    () => response.json(),
    () => new JsonParseError()
  );
  const responseBodyError = extractedResponseBodyResult.isFailure()
    ? {}
    : extractedResponseBodyResult.value;
  return parseResponseBodyWithSchema({
    body: responseBodyError,
    schema: errorSchema,
    path,
  });
}
