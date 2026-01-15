import { useQuery } from '@tanstack/react-query';

import { ApiErrorDisplayer } from '@modules/api/api-error-displayer.component';

import { categoriesQuery } from './categories.query';
import Select from 'react-select';

export interface SelectOption<TValue> {
  label: string;
  value: TValue;
}
export const DEFAULT_NUMBER = 0;

export const SelectFieldSkeleton = ({ label }: { label: string }) => {
  return (
    <div className="w-full">
      <label className={'text-medium text-sm'}>{label}</label>

      <Select
        isClearable={false}
        value={null}
        inputValue=""
        onChange={() => {}}
        options={[]}
        isLoading={true}
      />
    </div>
  );
};

export function CategoriesField() {
  const {
    data: categories = [],
    isPending,
    isLoading,
    isError,
    error,
  } = useQuery(
    categoriesQuery({
      sublineCode: 1,
    })
  );

  const categoryOptions = categories.map(
    (category) =>
      ({
        value: category.categoryCode,
        label: `${category.categoryCode} - ${category.categoryName}`,
      } satisfies SelectOption<number>)
  );

  if (isLoading) return <SelectFieldSkeleton label="Categoría" />;
  if (isError) return <ApiErrorDisplayer error={error} />;

  return (
    <div className="w-full">
      <label className="text-medium">Categoría</label>
      <Select
        isDisabled={isPending}
        options={categoryOptions}
        placeholder="Selecciona una categoría"
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            minHeight: '40px',
            height: '40px',
          }),
        }}
      />
    </div>
  );
}
