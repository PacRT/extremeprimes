'use strict';

const service = require('feathers-sequelize');
const sku = require('./sku-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: sku(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/skus', service(options));

  // Get our initialize service to that we can bind hooks
  const skuService = app.service('/skus');

  // Set up our before hooks
  skuService.before(hooks.before);

  // Set up our after hooks
  skuService.after(hooks.after);
};
