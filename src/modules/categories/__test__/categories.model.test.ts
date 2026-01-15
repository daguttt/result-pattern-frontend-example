import { adaptToCategory } from '@modules/categories/categories.model';

import { apiCategoryData, categoryData } from './data-mock';

describe('categories.model', () => {
  it('should transform ApiCategory to Category', () => {
    const result = adaptToCategory(apiCategoryData);

    expect(result).toEqual(categoryData);
  });
});
