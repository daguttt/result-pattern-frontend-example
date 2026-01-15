import { queryOptions } from '@tanstack/react-query';
import { getCategories } from './categories.service';

export const categoriesQuery = ({
  sublineCode,
  enabled = true,
}: {
  sublineCode: number;
  /**
   * @default true
   */
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ['categories', { sublineCode }],
    queryFn: () => getCategories({ sublineCode }),
    enabled,
  });
