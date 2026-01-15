import z from 'zod';

export const ApiBaseResponseSchema = z.object({
  codigoEstado: z.string(),
  mensajeError: z.string().nullable(),
  idTransaccion: z.uuid(),
});
export type ApiBaseResponse = z.infer<typeof ApiBaseResponseSchema>;

export const ApiPaginatedResponseSchema = z.object({
  ...ApiBaseResponseSchema.shape,
  paginaActual: z.number(),
  tamanoPagina: z.number(),
  totalPaginas: z.number(),
  totalRegistros: z.number(),
});

export type ApiPaginatedResponse = z.infer<typeof ApiPaginatedResponseSchema>;

export type PaginatedData<TData> = {
  totalPages: number;
  pageSize: number;
  currentPage: number;
  totalRecords: number;
  data: TData;
};

export function adaptToPaginatedData<TData>(
  apiPaginatedResponse: ApiPaginatedResponse,
  data: TData,
): PaginatedData<TData> {
  return {
    currentPage: apiPaginatedResponse.paginaActual,
    pageSize: apiPaginatedResponse.tamanoPagina,
    totalPages: apiPaginatedResponse.totalPaginas,
    totalRecords: apiPaginatedResponse.totalRegistros,
    data,
  };
}

export interface ErrorResponse {
  statusCode: string;
  errorMessage: string;
  transactionId: string;
  data: null;
}

export function adaptToErrorResponse(apiBaseResponse: ApiBaseResponse): ErrorResponse {
  return {
    statusCode: apiBaseResponse.codigoEstado,
    errorMessage:
      apiBaseResponse.mensajeError ?? 'Mensaje de error no proporcionado por el servidor',
    transactionId: apiBaseResponse.idTransaccion,
    data: null,
  };
}
