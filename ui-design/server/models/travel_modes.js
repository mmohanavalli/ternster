/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Travel_Modes = sequelize.define('Travel_Modes', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    mode_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: false,
    tableName: 'travel_modes'
  });

  // Travel_Modes.associate = (models) => {
  //   Travel_Modes.belongsTo(models.Trips, {
  //     foreignKey: 'mode',
  //     targetKey: 'id'
  //   });
  // }

  return Travel_Modes;
};
