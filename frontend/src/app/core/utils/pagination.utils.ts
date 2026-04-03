import { PageRequest, PageResponse } from '../models/pagination.models';

export function paginate<T>(
  items: T[],
  request: PageRequest,
  searchFn?: (item: T, searchTerm: string) => boolean
): PageResponse<T> {
  let filteredItems = [...items];

  // 1. Search
  if (request.searchTerm && searchFn) {
    const term = request.searchTerm.toLowerCase().trim();
    filteredItems = filteredItems.filter(item => searchFn(item, term));
  }

  // 2. Sort
  if (request.sortBy) {
    filteredItems.sort((a: T, b: T) => {
      const valA = a[request.sortBy as keyof T];
      const valB = b[request.sortBy as keyof T];
      
      if (valA < valB) return request.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return request.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // 3. Paginate
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / request.pageSize);
  
  // Ensure page is within bounds
  const currentPage = Math.max(1, Math.min(request.page, Math.max(1, totalPages)));
  
  const startIndex = (currentPage - 1) * request.pageSize;
  const endIndex = startIndex + request.pageSize;
  
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
    pageSize: request.pageSize
  };
}
