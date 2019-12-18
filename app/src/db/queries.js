const createUser = `
    INSERT INTO  users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *;`;
const createBus = `
    INSERT INTO  
    buses (number_plate, manufacturer, model, year, capacity)
    VALUES 
    ($1, $2, $3, $4, $5)
    RETURNING id bus_id, number_plate, manufacturer, model, year, capacity;`;
const createTrip = `
    INSERT INTO  
    trips (bus_id, origin, destination, trip_date, fare)
    VALUES 
    ($1, $2, $3, $4, $5)
    RETURNING  id, bus_id, to_char(trip_date, 'YYYY-MM-DD') trip_date, origin, destination, 
    fare::money::numeric, status;`;
const createBooking = `
    INSERT INTO bookings
    (trip_id, user_id, seat_number)
    VALUES 
    ($1, $2, $3)
    RETURNING *;`;
const cancelTrip = `
    UPDATE trips
    SET status = 'cancelled'
    WHERE id = $1
    RETURNING id AS trip_id, bus_id, origin, destination,
    to_char(trip_date, 'YYYY-MM-DD') trip_date, fare, status;`;
const deleteBooking = `DELETE FROM bookings b WHERE b.id = $1 RETURNING *;`;
const seedUser = `INSERT INTO  users (first_name, last_name, email, password, is_admin)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;`;
const emailExist = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1);';
const busExist = 'SELECT EXISTS(SELECT 1 FROM buses WHERE number_plate = $1);';
const bookingExist = 'SELECT EXISTS(SELECT 1 FROM bookings WHERE user_id = $1);';
const findBooking = `
    SELECT b.id booking_id, u.id user_id, t.id trip_id, 
    t.bus_id, to_char(t.trip_date, 'YYYY-MM-DD') trip_date,
    b.seat_number, u.first_name, u.last_name, u.email
    FROM bookings b INNER JOIN trips t
    ON b.trip_id = t.id
    INNER JOIN users u
    ON b.user_id = u.id
    WHERE b.id = $1;`;
const findBus = `
    SELECT id AS bus_id, number_plate, manufacturer, model, year, capacity
    FROM buses
    WHERE id = $1;`;
const findUserByEmail = 'SELECT * FROM users WHERE email = $1';
const findByPlateNumber = 'SELECT * FROM buses WHERE number_plate = $1;';
const findTripWithBusId = 'SELECT * FROM trips WHERE bus_id = $1;';
const findTripInBooking = `
    SELECT trips.status, buses.capacity, trips.bus_id, 
    to_char(trips.trip_date, 'YYYY-MM-DD') trip_date
    FROM trips INNER JOIN buses
    ON trips.bus_id = buses.id
    WHERE trips.id = $1;`;
const findTripById = `
    SELECT id AS trip_id, bus_id, origin, destination,
    to_char(trip_date, 'YYYY-MM-DD') trip_date, fare, status
    FROM trips
    WHERE id = $1;`;
const findAllTrips = `
    SELECT id AS trip_id, bus_id, origin, destination,
    to_char(trip_date, 'YYYY-MM-DD') trip_date, fare, status FROM trips;`;
const findAllBookingsForThisTrip = `
    SELECT seat_number
    FROM bookings INNER JOIN trips
    ON bookings.trip_id = trips.id
    WHERE trip_id = $1;`;
const findAllTripsFromOrigin = `
    SELECT id AS trip_id, bus_id, origin, destination,
    to_char(trip_date, 'YYYY-MM-DD') trip_date, fare, status FROM trips
    WHERE origin = $1;`;
const findAllTripsToDestination = `
    SELECT id AS trip_id, bus_id, origin, destination,
    to_char(trip_date, 'YYYY-MM-DD') trip_date, fare, status FROM trips
    WHERE destination = $1;`;
const findAllBookings = `SELECT b.id booking_id, u.id user_id, t.id trip_id, 
    t.bus_id, to_char(t.trip_date, 'YYYY-MM-DD') trip_date,
    b.seat_number, u.first_name, u.last_name, u.email
    FROM bookings b INNER JOIN trips t
    ON b.trip_id = t.id
    INNER JOIN users u
    ON b.user_id = u.id;`;
const findAllBookingsUser = `SELECT b.id booking_id, u.id user_id, t.id trip_id, 
    t.bus_id, to_char(t.trip_date, 'YYYY-MM-DD') trip_date,
    b.seat_number, u.first_name, u.last_name, u.email
    FROM bookings b INNER JOIN trips t
    ON b.trip_id = t.id
    INNER JOIN users u
    ON b.user_id = u.id
    WHERE b.user_id = $1;`;
const busExistWithId = 'SELECT EXISTS(SELECT 1 FROM buses WHERE id = $1);';
const dropTables = `
    DROP TYPE IF EXISTS STATUS CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS trips CASCADE;
    DROP TABLE IF EXISTS buses CASCADE;
    DROP TABLE IF EXISTS bookings CASCADE;
    `;
const createTables = `
    CREATE TYPE STATUS AS ENUM ('active', 'cancelled');

    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      is_admin BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS buses(
      id SERIAL PRIMARY KEY,
      number_plate TEXT UNIQUE NOT NULL,
      manufacturer TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL CHECK (year >= 2008 AND year <= 2020) DEFAULT 2008,
      capacity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips(
      id SERIAL PRIMARY KEY,
      bus_id INTEGER NOT NULL,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      trip_date TIMESTAMP NOT NULL DEFAULT NOW(),
      fare NUMERIC(12, 2) NOT NULL,
      status STATUS DEFAULT 'active' NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS bookings(
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      seat_number INTEGER NOT NULL CHECK(seat_number > 0),
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`;

module.exports = {
  createUser,
  createBus,
  createTrip,
  createBooking,
  cancelTrip,
  deleteBooking,
  emailExist,
  busExist,
  bookingExist,
  findBooking,
  busExistWithId,
  findTripById,
  findBus,
  findUserByEmail,
  findByPlateNumber,
  findTripInBooking,
  findTripWithBusId,
  findAllTrips,
  findAllTripsFromOrigin,
  findAllTripsToDestination,
  findAllBookingsForThisTrip,
  findAllBookings,
  findAllBookingsUser,
  dropTables,
  createTables,
  seedUser,
};
