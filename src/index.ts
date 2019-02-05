import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

import { apiRoutes } from './routes';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './openapi.json';

createConnection()
  .then(async connection => {
    // create express app
    const app = express();

    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        explorer: false,
      })
    );
    app.use('/api', apiRoutes);

    // start express server
    app.listen(3000);

    console.log('Express server has started on port 3000');
  })
  .catch(error => console.log(error));
