'use strict';

const service = require('feathers-sequelize');
const orderitem = require('./orderitem-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: orderitem(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/orderitems', service(options));

  // Get our initialize service to that we can bind hooks
  const orderitemService = app.service('/orderitems');

  // Set up our before hooks
  orderitemService.before(hooks.before);

  // Set up our after hooks
  orderitemService.after(hooks.after);
};
