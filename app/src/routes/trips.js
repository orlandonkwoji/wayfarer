import { Router } from 'express';
import { Trips } from '../controllers';
import Authorization from '../middleware/authorization';
import Validate from '../middleware/validate';

const { addTripValidator, addAllTripsValidator, cancelTripValidator, getTripValidator } = Validate;
const router = Router();
const { createTrip, getAllTrips, cancelTrip, getATrip } = Trips;
const { verifyAdmin, verifyUser } = Authorization;

router.post('/', verifyAdmin, addTripValidator, createTrip);
router.patch('/:trip_id', verifyAdmin, cancelTripValidator, cancelTrip);
router.get('/', verifyUser, addAllTripsValidator, getAllTrips);
router.get('/:trip_id', verifyUser, getTripValidator, getATrip);

export default router;
