/* eslint-disable camelcase */
import Booking from '../models/booking';
import {
  conflictResponse,
  internalErrREesponse,
  successResponse,
  nullResponse,
  badRequestResponse,
  forbiddenResponse,
} from '../utils/response';

class Bookings {
  static async createBooking(req, res) {
    try {
      const { trip_id } = req.body;
      let { seat_number } = req.body;

      // check if trip exist
      const trip_exist = await Booking.findTripInBooking(trip_id);
      if (!trip_exist) {
        return nullResponse(res, 'This trip is unavailable');
      }

      // check if trip is cancelled
      if (trip_exist && trip_exist.status === 'cancelled') {
        return badRequestResponse(res, 'This trip is cancelled');
      }

      // check if user is already booked on this trip
      const already_booked = await Booking.checkBookingExists(req.user.id);
      if (already_booked) {
        return conflictResponse(res, 'You are already booked on this trip');
      }
      const trip_bookings = await Booking.findAllBookingsOnTrip(trip_id);
      const trip_bookings_seats = trip_bookings.map(seat => seat.seat_number);
      const bus_capacity = trip_exist.capacity;
      const free_seats = Array.from({ length: bus_capacity }, (e, i) => i + 1).filter(
        e => !trip_bookings_seats.includes(e),
      );

      if (free_seats.length === 0) {
        return nullResponse(res, 'All seats on this trip have been booked');
      }

      if (seat_number && seat_number > bus_capacity) {
        return nullResponse(
          res,
          `This seat_number is unavailable for this trip. Available seat(s): (${free_seats.join(
            ', ',
          )})`,
        );
      }

      if (seat_number && !free_seats.includes(seat_number)) {
        return conflictResponse(
          res,
          `Seat is already occupied. Available seat(s): (${free_seats.join(', ')})`,
        );
      }

      if (!seat_number) {
        seat_number = free_seats.shift();
      }

      const { id, first_name, last_name, email } = req.user;
      const create_booking = await Booking.create(trip_id, id, seat_number);
      const output = {
        booking_id: create_booking.id,
        user_id: id,
        trip_id,
        bus_id: trip_exist.bus_id,
        trip_date: trip_exist.trip_date,
        seat_number,
        first_name,
        last_name,
        email,
      };
      return successResponse(res, 201, output);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }

  static async getAllBookings(req, res) {
    try {
      const get_bookings = await Booking.findAll(req.user);
      return successResponse(res, 200, get_bookings);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }

  static async getABooking(req, res) {
    try {
      const { booking_id } = req.params;
      const booking = await Booking.findBooking(booking_id);
      // check if booking exists
      if (!booking) {
        return nullResponse(res, 'A booking with this ID does not exist');
      }
      return successResponse(res, 200, booking);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }

  static async deleteBooking(req, res) {
    try {
      const { booking_id } = req.params;
      // check if booking exists
      const booking_exist = await Booking.findBooking(booking_id);
      if (!booking_exist) {
        return nullResponse(res, 'Booking not found');
      }
      const {
        user_id,
        trip_id,
        bus_id,
        trip_date,
        seat_number,
        first_name,
        last_name,
        email,
      } = booking_exist;
      if (user_id !== req.user.id) {
        return forbiddenResponse(res, 'This booking is not yours');
      }
      await Booking.deleteBooking(booking_id);
      const output = {
        message: 'Booking deleted successfully',
        booking_id,
        user_id,
        trip_id,
        bus_id,
        trip_date,
        seat_number,
        first_name,
        last_name,
        email,
      };
      return successResponse(res, 200, output);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }
}

export default Bookings;
