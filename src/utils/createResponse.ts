import { ServerResponse, ErrorResponse } from '@fabiant1498/llovizna-blog';

const createResponse = <T>(
  code: number,
  data: T | null,
  error: ErrorResponse | null
): ServerResponse<T> => {
  const response: ServerResponse<T> = {
    code,
    data,
    error,
  };

  return response;
};

export { createResponse };
