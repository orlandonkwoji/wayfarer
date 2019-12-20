# Wayfarer
#### [![Build Status](https://travis-ci.org/orlandonkwoji/wayfarer.svg?branch=develop)](https://travis-ci.org/orlandonkwoji/wayfarer)

WayFarer is a public bus transportation booking server. It makes it  unbelievably easy for a user to book a bus trip from the comfort of their homes, school, church, etc.

# Introduction

Welcome to version 1 of the WayFarer public bus transportation booking server. Below is a current list of available methods on different endpoints.

# Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Technologies
- Express
- Mocha & Chai
- ESLint
- Babel
- Travis CI
- Code Climate
- Coveralls

## Prerequisites

To work with this project, you need to have the following setup on your local machine

1. [NodeJS](https://nodejs.org)
2. [Git](https://git-scm.com/downloads)
3. [Postman](https://www.getpostman.com/downloads)

## Install and run locally

```bash
$ git clone https://github.com/orlando/wayfarer.git
$ cd WayFarer

$ npm i
 
$ npm run start:dev
```

# Pivotal Tracker ID

https://www.pivotaltracker.com/n/projects/2365211

# API Usage


```js
// login as admin
{
  email: "orlando@wayfarer.com",
  password: "Wayfarer10"
}

// login as user
{
  email: "wick@gmail.com",
  password: "Whykilmydog12"
}
```

API BASE URL http://localhost:3700. It is recommended to attach an `authorization` Header containing the generated `token` from `/api/v1/auth/signin` to access all routes. It should be added as `"Bearer token"`

## Authentication endpoints `/api/v1/auth`

| method | route        | description               | data                                          |
| ------ | ------------ | ------------------------- | ----------------------------------------------|
| POST   | /auth/signup | Sign Up                   | `{firstame, lastame, email, password}`      |
| POST   | /auth/signin | Sign In                   | `{email, password}`                           |



## Booking endpoints `/api/v1/bookings`

| method | route          | description             | data                                 |
| ------ | -------------- | ----------------------- | ------------------------------------ |
| POST   | /bookings      | Create a booking        |   `{trip_id, seat_number}`           |
| GET    | /bookings      | Get all bookings        |                                      |
| DELETE | /bookings/:booking_id | Delete a booking |                                      |

## Bus endpoint `/api/v1/buses`

| method | route            | description          | data                            |
| ------ | ---------------- | -------------------- | ------------------------------- |
| POST   | /buses           | Add a bus |  `{number_plate, manufacturer, year, model, capacity}`|
           

## Trip endpoints `/api/v1/trips`

| method | route          | description             | data                                 |
| ------ | -------------- | ----------------------- | ------------------------------------ |
| POST   | /trips      | Create a trip  |   `{ bus_id, origin, destination, fare}`         |
| GET    | /trips  | Get all trips           |                                             |
| GET    | /trips?origin  | Get trips filtered by origin           |                       |
| GET    | /trips?destination  | Get trips filtered by destination |                       |
| PATCH  | /trips/:trip_id  | Cancel a trip       |                                        |



## Admin only endpoints 

| method | route            | description               | 
| ------ | -----------------| ------------------------- |
| POST   | /api/v1/buses    | Add a bus                 |
| POST   | /api/v1/trips    | Create a trip             |
| PATCH  | /api/v1/trips/:trip_id | Cancel a trip       |




# API Docs
http://localhost:3700/api-docs
# App URL
http://localhost:3700/
# Author
Orlando Nkwoji
# LICENSE
The code in this project is licensed under MIT license.
