'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Meter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Meter.belongsTo(models.User, { foreignKey: 'userId' });
      Meter.hasMany(models.Bill, { foreignKey: 'meterId' });
      Meter.hasMany(models.Measure, { foreignKey: 'meterId' });
      Meter.hasOne(models.FeeConf, { foreignKey: 'meterId' });
      Meter.belongsToMany(models.User, { through: 'UserMeters', foreignKey: 'meterId', as: 'AuthorizedUsers' });
    }
  }
  Meter.init({
    number_meter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    status_meter: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Meter',
  });
  return Meter;
};