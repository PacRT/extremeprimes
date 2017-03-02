'use strict';

const service = require('feathers-sequelize');
const order = require('./order-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: order(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/orders', service(options));

  // Get our initialize service to that we can bind hooks
  const orderService = app.service('/orders');

  // Set up our before hooks
  orderService.before(hooks.before);

  // Set up our after hooks
  orderService.after(hooks.after);
};
