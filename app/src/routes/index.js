import { Router } from 'express';
import auth from './auth';
import trips from './trips';
import buses from './buses';
import booking from './booking';

const routes = Router();

routes.use('/auth', auth);
routes.use('/trips', trips);
routes.use('/buses', buses);
routes.use('/bookings', booking);

export default routes;
