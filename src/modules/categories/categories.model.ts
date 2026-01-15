import { z } from 'zod';

import { ApiBaseResponseSchema } from '@modules/api/base-response.model';

export const ApiCategorySchema = z.object({
  codigoCategoria: z.number(),
  descripcionCategoria: z.string(),
});
export type ApiCategory = z.infer<typeof ApiCategorySchema>;

export const ApiCategoriesResponseSchema = z.object({
  ...ApiBaseResponseSchema.shape,
  data: z.array(ApiCategorySchema),
});
export type ApiCategoriesResponse = z.infer<typeof ApiCategoriesResponseSchema>;

export interface Category {
  categoryCode: number;
  categoryName: string;
}

export function adaptToCategory(apiCategory: ApiCategory): Category {
  return {
    categoryCode: apiCategory.codigoCategoria,
    categoryName: apiCategory.descripcionCategoria,
  };
}
