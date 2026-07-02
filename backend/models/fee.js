'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Fee.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    dca: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    bs_limit: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    bs_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    md_limit: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    md_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    sp_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Fee',
  });
  return Fee;
};