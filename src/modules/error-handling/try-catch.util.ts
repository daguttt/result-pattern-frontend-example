import { Failure, type Result, Success } from './result.model';

/**
 * Run code in a failable context where thrown exceptions are converted to a result error (failure)
 * @example
 * ```ts
 * tryCatch(() => {throw 'uncaught'; return 123}, (e) => e);
 * ```
 * @template TValue The type of the value returned by the function
 * @template TError The type of the error returned by the function
 * @param fnValue A function that may throw an exception
 * @param onError A function that converts the exception to an error
 * @returns {Result<TValue, TError>} A result object
 */
export function tryCatch<TValue, TError>(
  fnValue: () => TValue,
  onError: (e: unknown) => TError
): Result<TValue, TError> {
  try {
    return new Success(fnValue());
  } catch (e) {
    return new Failure(onError(e));
  }
}

/**
 * Run code in a failable context where thrown exceptions are converted to a result error (failure)
 * @example
 * ```ts
 * tryCatchAsync(() => {throw 'uncaught'; return Promise.resolve(123)}, (e) => e);
 * ```
 *
 * @template TValue The type of the value returned by the function
 * @template TError The type of the error returned by the function
 * @param fnValue A function that may throw an exception and returns a promise
 * @param onError A function that converts the exception to an error
 * @returns {Promise<Result<TValue, TError>>} A promise that resolves to a result object
 */
export async function tryCatchAsync<TValue, TError>(
  fnValue: () => Promise<TValue>,
  onError: (e: unknown) => TError
): Promise<Result<TValue, TError>> {
  try {
    return new Success(await fnValue());
  } catch (e) {
    return new Failure(onError(e));
  }
}
