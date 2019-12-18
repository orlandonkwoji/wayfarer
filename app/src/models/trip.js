import db from '../db/config';
import query from '../db/queries';

/**
 * @classdesc Trip - the Trip model
 */
class Trip {
  /**
   * @typedef {Object} TripObject - a Bus object
   * @property {Number} trip_id - the ID of the Trip
   * @property {Number} bus_id - the ID of the Bus
   * @property {String} origin - the starting point of the trip
   * @property {String} destination - the end point of the trip
   * @property {String} trip_date - the date of the trip
   * @property {Number} fare- the cost of the trip per person
   * @property {String} status - the status of the trip. It is either "active" or "cancelled"
   */

  /**
   * @function create
   * @description - adds a bus to the database
   * @param {Object} obj - an object
   * @param {String} obj.bus_id - the ID of the bus
   * @param {String} obj.origin - the starting point of the trip. It must be different than the "location"
   * @param {String} obj.destination - the end point of the trip. It must be different than the "origin"
   * @param {Number} obj.trip_date - the date of the trip
   * @param {Number} obj.fare - the cost of the trip per person
   * @returns {TripObject} - the Bus that has been added to the database
   */
  async create({ bus_id, origin, destination, trip_date, fare }) {
    const { rows } = await db.query(query.createTrip, [
      bus_id,
      origin,
      destination,
      trip_date,
      fare,
    ]);
    return rows[0];
  }

  /**
   * @func findByBusId
   * @description - finds a trip with this bus_id from the database and returns it
   * @param {Number} bus_id - the bus ID of the trip
   * @returns {TripObject} - returns a Trip that is found from the database
   */
  async findByBusId(bus_id) {
    const { rows } = await db.query(query.findTripWithBusId, [bus_id]);
    return rows[0];
  }

  /**
   * @func findById
   * @description - finds a trip with this trip_id from the database and returns it
   * @param {Number} trip_id - the ID of the trip
   * @returns {TripObject} - returns a Trip that is found from the database
   */
  async findById(trip_id) {
    const { rows } = await db.query(query.findTripById, [trip_id]);
    return rows[0];
  }

  /**
   * @func cancelTrip
   * @description - cancels a trip from the database with this trip_id and returns it
   * @param {Number} trip_id - the ID of the trip
   * @returns {TripObject} - returns the cancelled Trip from the database
   */
  async cancelTrip(trip_id) {
    const { rows } = await db.query(query.cancelTrip, [trip_id]);
    return rows[0];
  }

  /**
   * @func checkBusExists
   * @description - checks if a Bus with this plateNumber exists on the database
   * @param {String} plateNumber - the plate number of the bus
   * @returns {Boolean} - returns a boolean value
   */
  async checkBusExists(plateNumber) {
    const { rows } = await db.query(query.busExist, [plateNumber]);
    return rows[0].exists;
  }

  /**
   * @func findAll
   * @description - finds all trips from the database and returns it
   * @param {Object} obj - an object
   * @param {String} obj.origin - the starting point of a trip. It is mutually exclusive with "location"
   * @param {String} obj.destination - the end point of a trip. It is mutually exlusive with "origin"
   * @returns {Object[]} TripObject - returns an array of Trip objects that is found from the database
   */
  async findAll({ origin, destination } = {}) {
    let allQuery;
    if (!origin && !destination) {
      allQuery = query.findAllTrips;
    } else if (origin && !destination) {
      allQuery = {
        text: query.findAllTripsFromOrigin,
        values: [origin],
      };
    } else {
      allQuery = {
        text: query.findAllTripsToDestination,
        values: [destination],
      };
    }
    const { rows } = await db.query(allQuery);
    return rows;
  }
}
export default new Trip();
