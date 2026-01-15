import { fetchApi } from '@modules/api/fetch-api.util';
import { createBaseRequestBody } from '@modules/api/base-request.model';

import {
  adaptToCategory,
  ApiCategoriesResponseSchema,
  type Category,
} from './categories.model';

export async function getCategories({
  sublineCode,
}: {
  sublineCode: number;
}): Promise<Category[]> {
  const categoriesResponseResult = await fetchApi({
    path: 'Categoria/ObtenerCategorias',
    options: {
      method: 'POST',
    },
    requestBody: createBaseRequestBody({
      data: { codigoSublinea: sublineCode },
    }),
    schema: ApiCategoriesResponseSchema,
  });

  if (categoriesResponseResult.isFailure())
    throw categoriesResponseResult.error;

  const apiCategoriesResponse = categoriesResponseResult.value;
  const apiCategories = apiCategoriesResponse.data;
  return apiCategories.map(adaptToCategory);
}
