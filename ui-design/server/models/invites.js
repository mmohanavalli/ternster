/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Invites = sequelize.define(
    "Invites",
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
      from_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      to_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      trip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      service_log_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      last_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "rejected",
          "paid",
          "disconnect",
          "delivered",
          "cancelled",
          "widthdraw"
        ),
        allowNull: false,
        defaultValue: "pending"
      },
      is_disconnect: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "0"
      },
      request_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      request_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      requestor_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_archived: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      archived_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      requester_trip_status: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      is_connection_continued: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "1"
      },
      package_status: {
        type: DataTypes.ENUM("created", "assigned", "delivered","withdraw"),
        allowNull: false,
        defaultValue: "created"
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
      tableName: "invites"
    }
  );

  Invites.associate = models => {
    Invites.belongsTo(models.Users, {
      foreignKey: "user_id",
      targetKey: "id"
    });
    Invites.belongsTo(models.Trips, {
      foreignKey: "trip_id",
      targetKey: "id"
    });
  };

  return Invites;
};
