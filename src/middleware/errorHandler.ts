import * as express from 'express';
import * as multer from 'multer';
import * as jwt from 'jsonwebtoken';

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

const handleValidationErrorMongoose = (err: any, res: express.Response) => {
  const errorMessages: Record<string, string[]> = {};

  for (let field in err.errors) {
    errorMessages[field] = err.errors[field].message;
  }

  let code = 400;

  return res.status(code).json(
    createResponse(false, null, {
      code,
      message: '',
      fields: errorMessages,
    })
  );
};

export const errorHandler = (app: express.Application) => {
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
      if (err.isJoi) {
        return handleValidationError(err, res);
      }

      return handleValidationErrorMongoose(err, res);
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
      return handleDuplicateKeyError(err, res);
    } else if (err.code === 404) {
      res.status(404).json({ error: 'Not found' });
    } else if (err instanceof jwt.TokenExpiredError) {
      // Manejar token expirado
      return res.status(401).json(
        createResponse(false, null, {
          code: 401,
          message: 'Token is expired',
        })
      );
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        createResponse(false, null, {
          code: 401,
          message: 'Token is invalid or bad formatted',
        })
      );
    } else {
      // Otros errores
      return res.status(500).json(
        createResponse(false, null, {
          code: 500,
          message: err.message,
        })
      );
    }
  });
};
