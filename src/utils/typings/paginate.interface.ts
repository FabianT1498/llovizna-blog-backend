export default interface PaginationResult<T> {
  results: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}
