import * as express from 'express';
import * as cors from 'cors';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as path from 'path';
import * as bodyParser from 'body-parser';

const corsOptions = {
  origin: ['http://192.168.1.3:3001', 'http://localhost:3001'], // O, especifica el origen de tu cliente
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  preflightContinue: false,
  allowedHeaders: ['x-access-token', 'Content-Type'],
  optionsSuccessStatus: 200,
};

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
  app.use(cors(corsOptions));

  // Loggin Middlware
  app.use(morgan('common'));

  // File handling Middleware
  app.use('/assets', express.static(path.join(currentDirPath, '../../', 'assets')));
};

export { configureGlobal };
