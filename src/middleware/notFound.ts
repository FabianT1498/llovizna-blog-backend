import * as express from 'express';

import { createResponse } from '@app/utils/createResponse';

export const notFound = (app: express.Application) => {
  // Not found handle
  app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
    return res.status(404).json(
      createResponse(404, null, {
        message: 'Not found',
      })
    );
  });
};
