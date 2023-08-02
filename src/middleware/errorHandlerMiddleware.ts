import * as express from 'express';
import * as multer from 'multer';

import { createResponse } from '@app/utils/createResponse';

const handleDuplicateKeyError = (err: any, res: express.Response) => {
  const fields = Object.keys(err.keyValue);
  let fieldsMessages: Record<string, string | string[]> = {};
  fields.forEach((field: string) => {
    fieldsMessages[field] = `${field} already exists`;
  });
  const code = 409;

  return res.status(409).json(
    createResponse(false, null, {
      code,
      message: '',
      fields: fieldsMessages,
    })
  );
};

const handleValidationError = (err: any, res: express.Response) => {
  let fields = err.details.map((el: any) => el.path.join(''));
  let fieldsMessages: Record<string, string[]> = {};

  err.details.forEach((el: any) => {
    let field = el.path.join('');

    if (fieldsMessages[field] === undefined) {
      fieldsMessages[field] = [el.message];
    } else if (Array.isArray(fieldsMessages[field])) {
      fieldsMessages[field].push(el.message);
    }
  });

  let code = 400;

  return res.status(code).json(
    createResponse(false, null, {
      code,
      message: '',
      fields: fieldsMessages,
    })
  );
};

export const errorHandlerMiddleware = (app: express.Application) => {
  // Error handling
  app.use(function (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (err instanceof multer.MulterError) {
      // Manejo de errores de Multer
      res.status(400).json({ error: err.message });
    } else if (err.name === 'ValidationError') {
      return handleValidationError(err, res);
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
      return handleDuplicateKeyError(err, res);
    } else {
      // Otros errores
      console.log(err.name);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};
