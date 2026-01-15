import { ApiCategoriesResponse, ApiCategory, Category } from '@modules/categories/categories.model';

export const apiCategoryData: ApiCategory = {
  codigoCategoria: 1,
  descripcionCategoria: 'Electrónica',
};

export const categoryData: Category = {
  categoryCode: 1,
  categoryName: 'Electrónica',
};

export const apiCategoriesResponseBody: ApiCategoriesResponse = {
  data: [
    {
      codigoCategoria: 1,
      descripcionCategoria: 'Electrónica',
    },
    {
      codigoCategoria: 2,
      descripcionCategoria: 'Ropa',
    },
  ],
  codigoEstado: '200',
  mensajeError: '',
  idTransaccion: 'test-transaction-id',
};

export const categoriesData: Category[] = [
  {
    categoryCode: 1,
    categoryName: 'Electrónica',
  },
  {
    categoryCode: 2,
    categoryName: 'Ropa',
  },
];
