/** Admin list filters — same shape as Angular `PageRequest` */
export interface PageRequest {
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/** Spring Data REST page payload */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export function mapSpringPageToPageResponse<T>(res: SpringPage<T>): PageResponse<T> {
  return {
    items: res.content ?? [],
    totalItems: res.totalElements ?? 0,
    totalPages: res.totalPages ?? 0,
    currentPage: (res.number ?? 0) + 1,
    pageSize: res.size ?? 0,
  };
}
