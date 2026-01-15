import { isFetchApiError } from './fetch-api-errors.model';

const MAX_RETRY_ATTEMPTS = 3;

export const retryWhenStatusDifferentToNotFound = (failureCount: number, error: unknown) => {
  const shouldRetry =
    isFetchApiError(error) &&
    error._tag === 'ApiResponseError' &&
    error.errorResponse.statusCode !== '404';

  if (!shouldRetry) return false;

  return failureCount < MAX_RETRY_ATTEMPTS;
};
