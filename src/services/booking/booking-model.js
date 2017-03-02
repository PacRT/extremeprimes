'use strict';

// booking-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function (sequelize) {
  const booking = sequelize.define('bookings',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      shippingdate:
      {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      returndate:
      {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    },
    {
      classMethods: {
        associate(models) {
          booking.belongsTo(models.products, {foreignKey: {allowNull: false}});
        }
      }
    },
    {
      freezeTableName: true
    }
    ,{
     indexes: [
     {
     name: 'booking_shipping_date_index',
     fields: ['returndate', 'shippingdate'],
     unique: true
     }/*,
     {
     name: 'availability_return_date_index',
     fields: [productSerialno, shipping_date],
     unique: true
     }*/],
     });

  //booking.sync({force: true});

  return booking;
};
