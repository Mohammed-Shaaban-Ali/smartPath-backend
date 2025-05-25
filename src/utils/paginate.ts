interface PaginateArrayResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export const paginateArray = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): PaginateArrayResult<T> => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = page > totalPages ? totalPages : page;
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const items = data.slice(startIndex, endIndex);

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
    perPage: limit,
  };
};
