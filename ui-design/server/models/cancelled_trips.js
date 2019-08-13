/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var CancelledTrips = sequelize.define(
    "CancelledTrips",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      trip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      is_ternster: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      is_requestor: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      timestamps: false,
      tableName: "cancelled_trips"
    }
  );

  CancelledTrips.associate = models => {
    CancelledTrips.belongsTo(models.Users, {
      foreignKey: "user_id",
      targetKey: "id"
    });
    CancelledTrips.belongsTo(models.Trips, {
      foreignKey: "trip_id",
      targetKey: "id"
    });
  };

  return CancelledTrips;
};
