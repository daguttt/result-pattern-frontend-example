import type { AppError } from '@modules/error-handling/app.error';
import { tryCatch, tryCatchAsync } from '@modules/error-handling/try-catch.util';

describe('try-catch.util', () => {
  describe('tryCatch', () => {
    it('should return Success when callback resolves', () => {
      const result = tryCatch(
        () => 'value',
        (e) => e,
      );
      expect(result.isSuccess()).toBe(true);
    });

    it('should return Failure when callback throws', () => {
      const result = tryCatch(
        () => {
          throw 'uncaught';
        },
        (e) => e,
      );
      expect(result.isFailure()).toBe(true);
    });

    it('should preserve the returned value in Success', () => {
      const expectedValue = { id: 1, name: 'test' };
      const result = tryCatch(
        () => expectedValue,
        (e) => e,
      );
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toEqual(expectedValue);
      }
    });

    it('should invoke onError with the thrown exception', () => {
      const onErrorMock = jest.fn((e) => new Error(`Handled: ${e}`));
      const thrownValue = 'test error';
      tryCatch(() => {
        throw thrownValue;
      }, onErrorMock);
      expect(onErrorMock).toHaveBeenCalledWith(thrownValue);
    });

    it('should transform error using onError handler', () => {
      class CustomError implements AppError {
        readonly _tag = 'CustomError';
        constructor(public message: string) {}
      }
      const result = tryCatch(
        () => {
          throw new Error('original error');
        },
        (e) => new CustomError(`Transformed: ${(e as Error).message}`),
      );
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(CustomError);
        expect(result.error.message).toBe('Transformed: original error');
      }
    });

    it('should handle Error objects thrown from callback', () => {
      const thrownError = new Error('test error');
      const result = tryCatch(
        () => {
          throw thrownError;
        },
        (e) => e,
      );
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBe(thrownError);
      }
    });

    it('should return Success with falsy value (null)', () => {
      const result = tryCatch(
        () => null,
        (e) => e,
      );
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe('tryCatchAsync', () => {
    it('should return Success when async callback resolves', async () => {
      const result = await tryCatchAsync(
        () => Promise.resolve('async value'),
        (e) => e,
      );
      expect(result.isSuccess()).toBe(true);
    });

    it('should return Failure when async callback rejects', async () => {
      const result = await tryCatchAsync(
        () => Promise.reject('async error'),
        (e) => e,
      );
      expect(result.isFailure()).toBe(true);
    });

    it('should preserve the resolved value in Success', async () => {
      const expectedValue = { id: 1, data: 'test' };
      const result = await tryCatchAsync(
        () => Promise.resolve(expectedValue),
        (e) => e,
      );
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toEqual(expectedValue);
      }
    });

    it('should invoke onError with the rejection reason', async () => {
      const onErrorMock = jest.fn((e) => new Error(`Handled: ${e}`));
      const rejectionReason = 'async rejection';
      await tryCatchAsync(() => Promise.reject(rejectionReason), onErrorMock);
      expect(onErrorMock).toHaveBeenCalledWith(rejectionReason);
    });

    it('should transform error using onError handler', async () => {
      class CustomAsyncError {
        constructor(public message: string) {}
      }
      const result = await tryCatchAsync(
        () => Promise.reject(new Error('original async error')),
        (e) => new CustomAsyncError(`Transformed: ${(e as Error).message}`),
      );
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(CustomAsyncError);
        expect(result.error.message).toBe('Transformed: original async error');
      }
    });

    it('should properly await the callback promise', async () => {
      let callbackExecuted = false;
      const result = await tryCatchAsync(
        () => {
          return new Promise<string>((resolve) => {
            setTimeout(() => {
              callbackExecuted = true;
              resolve('delayed value');
            }, 10);
          });
        },
        (e) => e,
      );
      expect(callbackExecuted).toBe(true);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe('delayed value');
      }
    });

    it('should return Success with falsy resolved value (null)', async () => {
      const result = await tryCatchAsync(
        () => Promise.resolve(null),
        (e) => e,
      );
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBeNull();
      }
    });
  });
});
