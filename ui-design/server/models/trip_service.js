/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    var TripService = sequelize.define('TripService', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      trip_ids: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      timestamps: false,
      tableName: 'trip_service'
    });
  
    return TripService;
  };
  