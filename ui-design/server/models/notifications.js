/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Notifications = sequelize.define(
    "Notifications",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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
      request_status: {
        type: DataTypes.ENUM(
          "accepted",
          "rejected",
          "pending",
          "paid",
          "disconnect",
          "delivered",
          "cancelled",
          "withdraw"
        ),
        allowNull: true
      },
      is_disconnect: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "0"
      },
      is_comment: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      comment_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      is_reply_comment: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      is_liked_comment: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      view_status: {
        type: DataTypes.ENUM("read", "unread"),
        allowNull: false,
        defaultValue: "unread"
      },
      request_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      request_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      request_courier_weight: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      request_members: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      is_archived: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      package_status: {
        type: DataTypes.ENUM("created", "assigned", "delivered","withdraw"),
        allowNull: false,
        defaultValue: "created"
      },
      is_from_cancelled_trip: {
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
      tableName: "notifications"
    }
  );

  Notifications.associate = models => {
    Notifications.belongsTo(models.Users, {
      foreignKey: "from_user_id",
      targetKey: "id"
    });

    Notifications.belongsTo(models.Trips, {
      foreignKey: "trip_id",
      targetKey: "id"
    });
  };

  return Notifications;
};
