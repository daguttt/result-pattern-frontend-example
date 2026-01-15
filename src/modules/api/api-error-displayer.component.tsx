import { ENV } from '@modules/env-vars/env.constant';

export type Prettify<T> = {
  [K in keyof T]: T[K];
};

import {
  type ApiResponseError,
  type ApiUnexpectedError,
  type BodySchemaMismatchError,
  type FetchApiError,
  isFetchApiError,
  type KyHttpError,
  type NetworkError,
} from './fetch-api-errors.model';

type Renderers = Prettify<{
  [K in FetchApiError['_tag']]?: (props: {
    error: FetchApiError;
  }) => React.ReactNode;
}>;

type RenderersProp = {
  renderers?: Renderers;
};

type GetApiErrorDisplayerProps<BaseProps extends object> = Prettify<
  BaseProps & RenderersProp
>;

type ApiErrorDisplayerProps = GetApiErrorDisplayerProps<{ error: unknown }>;

const BASE_ERROR_MESSAGE = 'Error al comunicarse con el servidor';

export interface ErrorElementProps {
  error: FetchApiError;
  customElement: React.ReactNode | undefined;
}

const errorElementsMap: Record<
  FetchApiError['_tag'],
  (props: ErrorElementProps) => React.ReactNode
> = {
  KyHttpError: ({ customElement, error }) => {
    const kyHttpError = error as KyHttpError;
    const status = kyHttpError.httpError.response.status;
    const statusText = kyHttpError.httpError.response.statusText;
    const message = kyHttpError.httpError.message;
    return (
      customElement ?? (
        <p>
          Error {status} | {message ?? statusText}
        </p>
      )
    );
  },
  BodySchemaMismatchError: ({ customElement, error }) => {
    const bodySchemaMismatchError = error as BodySchemaMismatchError;
    // TODO: Use validated env variable
    if (ENV.ENV_NAME === 'dev') {
      const message = `BodySchemaMismatchError fetching path: "${bodySchemaMismatchError.path}": ${bodySchemaMismatchError.cause}`;
      console.error(message, bodySchemaMismatchError.cause);
      throw new Error(message);
    }
    return (
      customElement ?? (
        <p>
          {BASE_ERROR_MESSAGE}. Codigo del error: {`"${error._tag}"`}
        </p>
      )
    );
  },
  KyTimeoutError: ({ customElement, error }) =>
    customElement ?? (
      <p>
        {BASE_ERROR_MESSAGE}. Tiempo de espera excedido. Código del error:{' '}
        {`"${error._tag}"`}
      </p>
    ),
  NetworkError: ({ customElement, error }) => {
    const networkError = error as NetworkError;
    console.error(
      '[API_ERROR_DISPLAYER] NetworkError occurred. See underlyingError below for details ⬇️.'
    );
    console.error(networkError.underlyingError);
    return (
      customElement ?? (
        <p>
          {BASE_ERROR_MESSAGE}. Verifica tu conexión a internet. Código del
          error: {`"${error._tag}"`}
        </p>
      )
    );
  },
  ApiResponseError: ({ customElement, error }) => {
    const apiErrorResponse = error as ApiResponseError;
    return (
      customElement ?? (
        <p>
          {BASE_ERROR_MESSAGE} |{' '}
          {`"${apiErrorResponse.errorResponse.errorMessage}"`}. Codigo del
          error: {`"${error._tag}"`}
        </p>
      )
    );
  },
  ApiUnexpectedError: ({ customElement, error }) => {
    const apiUnexpectedError = error as ApiUnexpectedError;
    return (
      customElement ?? (
        <>
          <p>Error técnico. Código del error: {`"${error._tag}"`}</p>
          <pre>{apiUnexpectedError.underlyingError}</pre>
        </>
      )
    );
  },
};

/**
 * Component to display errors from the API. This is meant to be
 * used at the page (route) or component level depending on where
 * is the data being fetched since it allows customizing default error
 * renderers to display custom markup or components.
 *
 * @example
 * ```tsx
 * // Component level
 * const MyComponent = () => {
 *   const { error, isError, isPending } = useQuery(someQueryOptions());
 *   if (isPending) return // Loading state or skeleton
 *   if (isError) return <ApiErrorDisplayer error={error} />;
 *   // Or customizing default error renderers ⬇️
 *   if (isError) return <ApiErrorDisplayer error={error} renderers={{ KyHttpError: () => <p>Custom error</p> }} />;
 *   return // Component content
 * }
 *
 * // Page level
 * const MyPage = () => {
 *   const { error, isError, isPending } = useQuery(someQueryOptions());
 *   if (isPending) return // Loading state or skeleton
 *   if (isError) return <ApiErrorDisplayer error={error} />;
 *   // Or customizing default error renderers ⬇️
 *   if (isError) return <ApiErrorDisplayer error={error} renderers={{ KyHttpError: () => <p>Custom error</p> }} />;
 *   return // Page content
 * }
 *
 * const router = createBrowserRouter([
 *   {
 *     path: '/some-path',
 *     element: <MyPage />,
 *   },
 * ]);
 * ```
 *
 * @param error - The error from the API
 * @param renderers - Optional custom renderers for specific error types
 */
export const ApiErrorDisplayer = ({
  error,
  renderers,
}: ApiErrorDisplayerProps) => {
  if (isFetchApiError(error)) {
    const customElement = renderers?.[error._tag];

    return errorElementsMap[error._tag]({
      error,
      customElement: customElement?.({ error }),
    });
  }

  return <p>{BASE_ERROR_MESSAGE}</p>;
};
