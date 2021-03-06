'use strict';

// user-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const user = sequelize.define('users', {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [10, 40]
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    group: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'END_USER'
    }
  }, {
    freezeTableName: true
  });

  //user.sync()

  return user;
};
