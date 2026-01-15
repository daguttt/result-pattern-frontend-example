import {
  apiResponseError,
  mockFetchApiFailureValue,
  mockFetchApiSuccessValue,
} from '@modules/api/__test__/fetch-api-mock.util';
import { getCategories } from '@modules/categories/categories.service';

import { apiCategoriesResponseBody, categoriesData } from './data-mock';

jest.mock('ky', () => ({
  create: jest.fn(),
}));

jest.mock('@modules/env-vars/env.constant', () => ({
  ENV: {
    API: 'mocked-api',
  },
}));

describe('categories.service', () => {
  describe('getCategories', () => {
    it('should return data when request is success', async () => {
      mockFetchApiSuccessValue(apiCategoriesResponseBody);

      const response = await getCategories({
        sublineCode: 1,
      });
      expect(response).toEqual(categoriesData);
    });

    it('should not return data when request is failed', async () => {
      mockFetchApiFailureValue();

      const result = getCategories({
        sublineCode: 1,
      });

      await expect(result).rejects.toBe(apiResponseError);
    });
  });
});
