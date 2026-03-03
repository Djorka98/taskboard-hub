export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export const getPagination = (page = 1, pageSize = 20) => {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.min(Math.max(pageSize, 1), 100);

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
};
