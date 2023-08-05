import { Query } from 'mongoose';

import PaginationResult from './typings/paginate.interface';

const getPaginateData = async <T>(
  page: number,
  pageSize: number,
  query: Query<T[], T>,
  isNewQuery: boolean = true
): Promise<PaginationResult<T>> => {
  let offset = (page - 1) * pageSize;

  if (!isNewQuery) {
    query = query.clone();
  }

  let results = await query.skip(offset).limit(pageSize);
  let total = await query.clone().countDocuments();

  let totalPages = Math.ceil(total / pageSize);

  return {
    results,
    total,
    totalPages,
    currentPage: page,
  };
};

export async function paginate<T>(
  query: Query<T[], T>,
  page: number | string = 1,
  pageSize: number | string = 10
): Promise<PaginationResult<T>> {
  let pageNumber: number = typeof page === 'string' ? parseInt(page) : page >= 1 ? page : 1;

  let pageSizeNumber: number =
    typeof pageSize === 'string' ? parseInt(pageSize) : pageSize > 0 ? pageSize : 10;

  if (isNaN(pageNumber)) pageNumber = 1;
  if (isNaN(pageSizeNumber)) pageSizeNumber = 10;

  let result = await getPaginateData(pageNumber, pageSizeNumber, query);

  if (result.total === 0 && result.currentPage > 1) {
    pageNumber = 1;
    result = await getPaginateData(pageNumber, pageSizeNumber, query, false);
  }

  return result;
}
