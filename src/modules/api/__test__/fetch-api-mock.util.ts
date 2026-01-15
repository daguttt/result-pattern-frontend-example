import { ApiBaseResponse } from '@modules/api/base-response.model';
import { ApiResponseError, FetchApiError } from '@modules/api/fetch-api-errors.model';
import * as fetchApiModule from '@modules/api/fetch-api.util';
import { Failure, Success, type Result } from '@modules/error-handling/result.model';

export const mockFetchApiSuccess = <T>(value: T): Result<T, FetchApiError> =>
  new Success<T, FetchApiError>(value);

export const mockFetchApiFailure = <T>(error: FetchApiError): Result<T, FetchApiError> =>
  new Failure<T, FetchApiError>(error);

export const mockFetchApiFailureValue = () => {
  jest
    .spyOn(fetchApiModule, 'fetchApi')
    .mockResolvedValueOnce(mockFetchApiFailure(apiResponseError));
};

export const mockFetchApiSuccessValue = <T>(value: T) => {
  jest.spyOn(fetchApiModule, 'fetchApi').mockResolvedValueOnce(mockFetchApiSuccess(value));
};

export const apiResponseError = ApiResponseError.create({
  errorResponse: {
    data: null,
    errorMessage: 'Error',
    statusCode: '500',
    transactionId: 'test-transaction-id',
  },
});

export const apiBaseResponse: ApiBaseResponse = {
  codigoEstado: '200',
  idTransaccion: '123e4567-e89b-12d3-a456-426614174000',
  mensajeError: null,
};
