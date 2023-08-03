import * as express from 'express';

const removeBodyProps =
  (props: string[]) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body) {
      props.forEach((prop) => {
        if (req.body[prop] !== undefined) {
          delete req.body[prop];
        }
      });
    }
    next();
  };

export { removeBodyProps };
