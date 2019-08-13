/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var CscLists = sequelize.define('CscLists', {
    id: {
      type: DataTypes.INTEGER(25),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    country_id: {
      type: DataTypes.INTEGER(25),
      allowNull: true
    },
    state_id: {
      type: DataTypes.INTEGER(25),
      allowNull: true
    },
    city_id: {
      type: DataTypes.INTEGER(25),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'csclists',
    timestamps: false
  });
  return CscLists
};
