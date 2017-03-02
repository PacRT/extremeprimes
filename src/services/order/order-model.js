'use strict';

// order-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const order = sequelize.define('orders', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {isEmail: true}
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false
    },
    shipping_address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    billing_address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  },
    {
      classMethods: {
        associate(models) {
          order.hasMany(models.orderitems, {foreignKey: {allowNull: false}});
        }
      }
    },

    {
    freezeTableName: true
  });

  //order.sync({force: true});

  return order;
};
