import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import swaggerDocument from '../swagger.json';
import routes from './src/routes';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
/* eslint-disable-next-line consistent-return */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});
app.use(cors());
app.use('/api/v1', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Wayfarer',
  });
});

export default app;
