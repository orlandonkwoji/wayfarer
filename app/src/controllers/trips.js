import moment from 'moment';
import Trip from '../models/trip';
import Bus from '../models/bus';
import {
  conflictResponse,
  internalErrREesponse,
  successResponse,
  nullResponse,
} from '../utils/response';
import trip from '../models/trip';

class Trips {
  static async createTrip(req, res) {
    try {
      const { bus_id, origin, destination, trip_date, fare } = req.body;
      const busExist = await Bus.busExistsWithId(bus_id);

      if (!busExist) {
        return nullResponse(res, 'This bus is unavailable');
      }
      const tripWithBus = await Trip.findByBusId(bus_id);
      if (tripWithBus && tripWithBus.status === 'active') {
        return conflictResponse(res, 'An active trip with this bus exists');
      }
      const date = moment(trip_date).toDate();
      const createTrip = await Trip.create({ bus_id, origin, destination, trip_date: date, fare });
      const output = {
        trip_id: createTrip.id,
        bus_id,
        origin,
        destination,
        trip_date: createTrip.trip_date,
        fare,
        status: createTrip.status,
      };
      return successResponse(res, 201, output);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }

  static async getAllTrips(req, res) {
    const { origin, destination } = req.query;
    try {
      const getAllTrips = await Trip.findAll({ origin, destination });
      return successResponse(res, 200, getAllTrips);
    } catch (error) {
      return internalErrREesponse(res, error.stack);
    }
  }

  static async cancelTrip(req, res) {
    try {
      const { trip_id } = req.params;
      const trip_exist = await Trip.findById(trip_id);
      // check if trip exists
      if (!trip_exist) {
        return nullResponse(res, 'This trip does not exist');
      }
      // check if trip is already cancelled
      if (trip_exist && trip_exist.status === 'cancelled') {
        return conflictResponse(res, 'This trip is already cancelled');
      }
      const cancel_trip = await Trip.cancelTrip(trip_id);

      const output = {
        message: 'Trip cancelled successfully',
        ...cancel_trip,
      };
      return successResponse(res, 200, output);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }

  static async getATrip(req, res) {
    try {
      const { trip_id } = req.params;
      const trip_exist = await Trip.findById(trip_id);
      // check if trip exists
      if (!trip_exist) {
        return nullResponse(res, 'A trip with this ID does not exist');
      }
      return successResponse(res, 200, trip_exist);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }
}

export default Trips;
