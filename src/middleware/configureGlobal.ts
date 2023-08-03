import * as express from 'express';
import * as cors from 'cors';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as path from 'path';
import * as bodyParser from 'body-parser';

const configureGlobal = (app: express.Application) => {
  const currentFilename = __filename;
  const currentDirPath = path.dirname(currentFilename);

  // Parsing request body middlewares
  app.use(express.json());
  app.use(bodyParser.json({ limit: '30mb' }));
  app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

  // Security Middlewares
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.use(cors());

  // Loggin Middlware
  app.use(morgan('common'));

  // File handling Middleware
  app.use('/assets', express.static(path.join(currentDirPath, '../../', 'assets')));
};

export { configureGlobal };
