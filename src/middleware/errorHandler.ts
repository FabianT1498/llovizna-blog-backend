import * as express from 'express';
import * as multer from 'multer';
import * as jwt from 'jsonwebtoken';

import { createResponse } from '@app/utils/createResponse';

const handleDuplicateKeyError = (err: any, res: express.Response) => {
  const fields = Object.keys(err.keyValue);
  let fieldsMessages: Record<string, string> = {};
  fields.forEach((field: string) => {
    fieldsMessages[field] = `${field} already exists`;
  });
  const code = 409;

  return res.status(code).json(
    createResponse(code, null, {
      message: '',
      fields: fieldsMessages,
    })
  );
};

const handleValidationError = (err: any, res: express.Response) => {
  let fieldsMessages: Record<string, string> = {};

  err.details.forEach((el: any) => {
    let field = el.path.join('');

    if (fieldsMessages[field] === undefined) {
      fieldsMessages[field] = el.message;
    }
  });

  let code = 400;

  return res.status(code).json(
    createResponse(code, null, {
      message: '',
      fields: fieldsMessages,
    })
  );
};

const handleValidationErrorMongoose = (err: any, res: express.Response) => {
  const errorMessages: Record<string, string> = {};

  for (let field in err.errors) {
    errorMessages[field] = err.errors[field].message;
  }

  let code = 400;

  return res.status(code).json(
    createResponse(code, null, {
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
    let code = 400;

    if (err instanceof multer.MulterError) {
      // Manejo de errores de Multer
      res.status(code).json({ error: err.message });
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
      code = 401;
      return res.status(code).json(
        createResponse(code, null, {
          message: 'Token is expired',
        })
      );
    } else if (err instanceof jwt.JsonWebTokenError) {
      code = 401;
      return res.status(code).json(
        createResponse(code, null, {
          message: 'Token is invalid or bad formatted',
        })
      );
    } else {
      code = 500;
      // Otros errores
      return res.status(code).json(
        createResponse(code, null, {
          message: err.message,
        })
      );
    }
  });
};
