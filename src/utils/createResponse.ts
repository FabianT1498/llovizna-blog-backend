import { ServerResponse, ErrorResponse } from '@fabiant1498/llovizna-blog';

const createResponse = <T>(
  success: boolean,
  data: T | null,
  error: ErrorResponse | null
): ServerResponse<T> => {
  const response: ServerResponse<T> = {
    success,
    data,
    error,
  };

  return response;
};

export { createResponse };
