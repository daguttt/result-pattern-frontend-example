import type { UrlPagination } from '@modules/pagination/pagination.model';

export type BaseRequestBody<TData> = {
  idTransaccion: string;
  nombreHost: string;
  data: TData | null;
};

export type PaginatedRequestBody<TData> = BaseRequestBody<TData> & {
  paginaActual: number;
  tamanoPagina: number;
};

export function createBaseRequestBody<TData>({
  data,
}: { data?: TData } = {}): BaseRequestBody<TData> {
  const dataOrNull = (() => {
    if (data === undefined) return null;
    if (Object.keys(data ?? {}).length === 0) return null;
    return data;
  })();

  return {
    idTransaccion: crypto.randomUUID(),
    nombreHost: 'front-crearLegalPop',
    data: dataOrNull,
  };
}

export function createPaginatedRequestBody<TData>({
  pagination,
  data,
}: {
  pagination: UrlPagination;
  data?: TData;
}): PaginatedRequestBody<TData> {
  const baseRequestBody = createBaseRequestBody({ data });
  return {
    ...baseRequestBody,
    paginaActual: pagination.page,
    tamanoPagina: pagination.pageSize,
  };
}
