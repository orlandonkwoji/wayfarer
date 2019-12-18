import { Router } from 'express';
import { Bookings } from '../controllers';
import Authorization from '../middleware/authorization';
import Validate from '../middleware/validate';

const {
  addBookingValidator,
  getBookingsValidator,
  deleteBookingValidator,
  getBookingValidator,
} = Validate;
const router = Router();
const { createBooking, getAllBookings, deleteBooking, getABooking } = Bookings;
const { verifyUser } = Authorization;

router.post('/', verifyUser, addBookingValidator, createBooking);
router.get('/:booking_id', verifyUser, getBookingValidator, getABooking);
router.get('/', verifyUser, getBookingsValidator, getAllBookings);
router.delete('/:booking_id', verifyUser, deleteBookingValidator, deleteBooking);

export default router;
