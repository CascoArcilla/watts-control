'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeConf extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FeeConf.belongsTo(models.Fee, { foreignKey: 'feeId' });
      FeeConf.belongsTo(models.Meter, { foreignKey: 'meterId' });
    }
  }
  FeeConf.init({
    feeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meterId: {
      type: DataTypes.INTEGER,
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
    }
  }, {
    sequelize,
    modelName: 'FeeConf',
  });
  return FeeConf;
};