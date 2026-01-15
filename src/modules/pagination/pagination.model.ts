import type { PaginatedData } from '@modules/api/base-response.model';
import { z } from 'zod';

export const UrlPaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
});

export type UrlPagination = z.infer<typeof UrlPaginationSchema>;

export const DEFAULT_PAGINATION: UrlPagination = {
  page: 1,
  pageSize: 25,
};

export const defaultPaginatedValues = <T>(): PaginatedData<T[]> => ({
  data: [],
  currentPage: 1,
  totalPages: 1,
  pageSize: 25,
  totalRecords: 0,
});
