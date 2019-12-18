import db from '../db/config';
import query from '../db/queries';

/**
 * @classdesc Booking - the Booking model
 */
class Booking {
  /**
   * @typedef {Object} BookingObject - a Bus object
   * @property {Number} booking_id - the ID of the booking
   * @property {Number} user_id - the ID of the user
   * @property {Number} trip_id - the ID of the Trip
   * @property {Number} bus_id - the ID of the Bus
   * @property {String} trip_date - the date of the trip
   * @property {Number} seat_number - the number of the seat
   * @property {String} first_name - the first name of the user
   * @property {String} last_name - the last name of the user
   * @property {String} email - the email of the user
   */

  /**
   * @function create
   * @description - creates a booking
   * @param {Number} trip_id - the ID of the trip
   * @param {Number} user_id - the ID of the user
   * @param {Number} seat_number - the number of the seat
   * @returns {BookingObject} - the Bus that has been added to the database
   */
  async create(trip_id, user_id, seat_number) {
    const { rows } = await db.query(query.createBooking, [trip_id, user_id, seat_number]);
    return rows[0];
  }

  /**
   * @func findTripInBooking
   * @description - finds a trip with this trip_id from the database and returns it
   * @param {Number} trip_id - the ID of the trip
   * @returns {Object}
   */
  async findTripInBooking(trip_id) {
    const { rows } = await db.query(query.findTripInBooking, [trip_id]);
    return rows[0];
  }

  /**
   * @func checkBookingExists
   * @description - checks if a Booking with this "user_id" exists on the database
   * @param {String} user_id - the ID of the user
   * @returns {Boolean} - returns a boolean value
   */
  async checkBookingExists(user_id) {
    const { rows } = await db.query(query.bookingExist, [user_id]);
    return rows[0].exists;
  }

  /**
   * @func findBooking
   * @description - finds a booking with this "booking_id" and returns it
   * @param {String} booking_id - the ID of the booking
   * @returns {BookingObject} - returns a booking object
   */
  async findBooking(booking_id) {
    const { rows } = await db.query(query.findBooking, [booking_id]);
    return rows[0];
  }

  /**
   * @func findAllBookingsOnTrip
   * @description - finds all trips from the database and returns it
   * @param {String} trip_id - the end point of a trip. It is mutually exlusive with "origin"
   * @returns {Object[]} BookingObject - returns an array of Trip objects that is found from the database
   */
  async findAllBookingsOnTrip(trip_id) {
    const { rows } = await db.query(query.findAllBookingsForThisTrip, [trip_id]);
    return rows;
  }

  /**
   * @func findAll
   * @description - finds all bookings from the database and returns it
   * @param {Object} user
   * @param {Boolean} user.is_admin - the admin status of the user object
   * @param {Number} user.id - the ID of the user object
   * @returns {Object[]} BookingObject - returns an array of Booking objects that is found from the database
   */
  async findAll(user) {
    const allQuery = user.is_admin
      ? query.findAllBookings
      : {
          text: query.findAllBookingsUser,
          values: [user.id],
        };
    const { rows } = await db.query(allQuery);
    return rows;
  }

  /**
   * @func deleteBooking
   * @description - deletes a booking from the database with this booking_id and returns it
   * @param {Number} booking_id - the ID of the booking
   * @returns {BookingObject} - returns the booking that is deleted from the database
   */
  async deleteBooking(booking_id) {
    const { rows } = await db.query(query.deleteBooking, [booking_id]);
    return rows[0];
  }
}
export default new Booking();
