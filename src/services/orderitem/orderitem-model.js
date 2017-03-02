'use strict';

// orderitem-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const orderitem = sequelize.define('orderitems', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    classMethods: {
      associate(models) {
        orderitem.belongsTo(models.skus, {foreignKey: {allowNull: false}});
      }
    }
  },{
    freezeTableName: true
  });

  //orderitem.sync();

  return orderitem;
};
