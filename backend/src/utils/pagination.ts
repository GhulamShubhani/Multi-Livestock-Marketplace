export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePagination(
  pageRaw: unknown,
  limitRaw: unknown,
  maxLimit = 100,
): PaginationQuery {
  const page = Math.max(1, Number(pageRaw) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(limitRaw) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
