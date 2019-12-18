import Bus from '../models/bus';
import {
  conflictResponse,
  internalErrREesponse,
  successResponse,
  nullResponse,
} from '../utils/response';

class Buses {
  static async addBus(req, res) {
    try {
      const busExists = await Bus.checkBusExists(req.body.number_plate);
      if (busExists) {
        return conflictResponse(res, 'A bus with this plate number already exists');
      }
      const { number_plate, manufacturer, model, year, capacity } = req.body;
      const addBus = await Bus.create({ number_plate, manufacturer, model, year, capacity });
      return successResponse(res, 201, addBus);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }

  static async getABus(req, res) {
    try {
      const aBus = await Bus.findBus(req.params.bus_id);
      if (!aBus) {
        return nullResponse(res, 'A bus with this ID is not found');
      }
      return successResponse(res, 200, aBus);
    } catch (errors) {
      return internalErrREesponse(res, errors.stack);
    }
  }
}

export default Buses;
