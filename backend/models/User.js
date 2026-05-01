'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Meter, { foreignKey: 'userId' });
      User.hasMany(models.Bill, { foreignKey: 'userId' });
      User.hasMany(models.Measure, { foreignKey: 'userId' });
      User.belongsToMany(models.Group, { through: 'UserGroups', foreignKey: 'userId' });
      User.belongsToMany(models.Meter, { through: 'UserMeters', foreignKey: 'userId', as: 'AuthorizedMeters' });
      User.hasMany(models.UserToken, { foreignKey: 'userId' });
    }
  }
  User.init({
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_bloked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    use_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};