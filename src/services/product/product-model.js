'use strict';

// product-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const product = sequelize.define('products', {
    serialno: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    /*sku: {
      type: Sequelize.STRING,
      allowNull: false
    },*/
    availability: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    shippingdate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    returndate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  },
    {
      classMethods: {
        associate(models) {
          product.belongsTo(models.skus, {foreignKey: {allowNull: false}});
        }
      }
    },
    {
    freezeTableName: true
  });

  //product.sync();

  return product;
};
