'use strict';

const service = require('feathers-sequelize');
const booking = require('./booking-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: booking(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/bookings', service(options));

  // Get our initialize service to that we can bind hooks
  const bookingService = app.service('/bookings');

  // Set up our before hooks
  bookingService.before(hooks.before);

  // Set up our after hooks
  bookingService.after(hooks.after);
};
