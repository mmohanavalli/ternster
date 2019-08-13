/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Trips = sequelize.define(
    "Trips",
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
      service_log_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      trip_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      mode: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      departure: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      destination: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      trip_plan: {
        type: DataTypes.ENUM("planned", "unplanned"),
        allowNull: false,
        defaultValue: "planned"
      },
      unplanned_days: {
        type: DataTypes.ENUM("0", "7", "15", "30", "60"),
        allowNull: true,
        defaultValue: ""
      },
      from_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      to_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      type: {
        type: DataTypes.ENUM("courier", "assistance", "companion"),
        allowNull: false,
        defaultValue: "courier"
      },
      is_courier: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "1"
      },
      is_assistance: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      is_companion: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },      
      trip_unplanned_days: {
        type: DataTypes.ENUM("0", "7","30"),
        allowNull: false,
        defaultValue: "0"
      },
      currency_code: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      currency_symbol: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      base_currency_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      courier_budget: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      weight_unit: {
        type: DataTypes.ENUM("kg", "lb", "oz"),
        allowNull: false,
        defaultValue: "kg"
      },
      weight: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      balance_weight: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "0"
      },
      assistance_budget: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      perks_id: {
        type: DataTypes.INTEGER(10),
        allowNull: false
      },
      is_new: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active"
      },
      is_connection_continued: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "1"
      },
      trip_status: {
        type: DataTypes.ENUM("open", "close", "cancel"),
        allowNull: false,
        defaultValue: "open"
      },
      payment_mode: {
        type: DataTypes.ENUM("gateway", "offline"),
        allowNull: false,
        defaultValue: "gateway"
      },
      is_approved: {
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
      tableName: "trips"
    }
  );

  Trips.associate = models => {
    Trips.belongsTo(models.Users, {
      foreignKey: "user_id",
      targetKey: "id"
    });

    Trips.hasMany(models.Invites, {
      foreignKey: "trip_id",
      targetKey: "id"
    });

    Trips.belongsTo(models.Travel_Modes, {
      foreignKey: "mode",
      targetKey: "id"
    });
    Trips.belongsTo(models.Currency, {
      foreignKey: "base_currency_id",
      targetKey: "id"
    });
    Trips.hasMany(models.Favorites, {
      foreignKey: "trip_id",
      targetKey: "id"
    });

    // Trips.hasMany(models.Currency, {
    //   foreignKey: "code",
    //   targetKey: "id"
    // });
  };

  return Trips;
};
