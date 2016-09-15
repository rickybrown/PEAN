'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'This email is already in use'
      },
      validate: {
        isEmail: true
      }
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    customerId: DataTypes.STRING,
    cardId: DataTypes.STRING,
    card: DataTypes.STRING,
    last4: DataTypes.INTEGER,
    exp: DataTypes.STRING,

  }, {
    classMethods: {
      associate: function(models) {
        models.User.hasMany(models.Post);
        models.User.hasMany(models.Identity);
      }
    }
  });
  return User;
};
