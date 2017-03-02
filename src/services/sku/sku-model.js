'use strict';

// sku-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const sku = sequelize.define('skus', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    manufacturer: {
      type: Sequelize.STRING,
      allowNull: false
    },
    model: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: { //camera, lens, tripod
      type: Sequelize.STRING,
      allowNull: false
    },
    category: { //On the water, in the water, SLR SLayeR
      type: Sequelize.STRING,
      allowNull: true
    },
    totalquantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    quantityavailable: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    introdate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    marketprice: {
      type: Sequelize.DECIMAL(10,2),
      allowNull: false
    },
    links: {
      type: Sequelize.STRING,
      allowNull: true
    },
    /*accessories: {
      // SKUs of compatible accessories like compatible lenses
      type: Sequelize.STRING,
      allowNull: true
    },*/
    relatedskus: {
      //the products that can be used with this or normally used together
      type: Sequelize.STRING,
      allowNull: true
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    reviews: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  },
    {
    classMethods: {
      associate(models) {
        sku.belongsToMany(sku, {as: 'Accessories', through: 'sku_accessories'});
      }
    }
  },{
    freezeTableName: true
  });

  //sku.sync();

  return sku;
};
