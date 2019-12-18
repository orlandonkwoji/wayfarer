import db from '../db/config';
import query from '../db/queries';

/**
 * @classdesc Bus - the Bus model
 */
class Bus {
  /**
   * @typedef {Object} BusObject - a Bus object
   * @property {Number} bus_id - the ID of the Bus
   * @property {String} number_plate- the plate number of the Bus
   * @property {String} manufacturer- the manufacturer of the Bus
   * @property {String} model- the model of the Bus
   * @property {Number} year - the year the bus was manufactured
   * @property {Number} capacity - the capacity of the bus
   */
  /**
   * @function create
   * @description - adds a bus to the database
   * @param {Object} obj - an object
   * @param {String} obj.number_plate - the plate number of the bus
   * @param {String} obj.manufacturer - the manufacturer of the bus
   * @param {String} obj.model - the model of the bus
   * @param {Number} obj.year - the year the bus was manufactured
   * @param {Number} obj.capacity - the capacity of the bus
   * @returns {BusObject} - the Bus that has been added to the database
   */
  async create({ number_plate, manufacturer, model, year, capacity }) {
    const { rows } = await db.query(query.createBus, [
      number_plate,
      manufacturer,
      model,
      year,
      capacity,
    ]);
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
   * @func busExistsWithId
   * @description - checks if a Bus with this ID exists on the database
   * @param {Number} id - the ID of the Bus
   * @returns {Boolean} - returns a boolean value
   */
  async busExistsWithId(id) {
    const { rows } = await db.query(query.busExistWithId, [id]);
    return rows[0].exists;
  }

  /**
   * @function findBus
   * @description - finds a Bus from the database and returns it
   * @param {Number} id - the ID of the Bus
   * @returns {BusObject} - the Bus that has been added to the database
   */
  async findBus(id) {
    const { rows } = await db.query(query.findBus, [id]);
    return rows[0];
  }
}

export default new Bus();
