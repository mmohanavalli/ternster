/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Payments = sequelize.define(
    "Payments",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      trip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      trip_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      strip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      requestor_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      requestor_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      budget: {
        type: DataTypes.INTEGER(20),
        allowNull: false,
        defaultValue: "0"
      },
      total_weight: {
        type: DataTypes.INTEGER(20),
        allowNull: true
      },
      ternster_commission: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      total_payment: {
        type: DataTypes.DOUBLE(2),
        allowNull: false
      },
      actual_payment: {
        type: DataTypes.DOUBLE(2),
        allowNull: false
      },
      converted_payment: {
        type: DataTypes.DOUBLE(2),
        allowNull: false
      },
      refund_amount: {
        type: DataTypes.DOUBLE(2),
        allowNull: true
      },
      currency_id: {
        type: DataTypes.INTEGER(20),
        allowNull: false
      },
      converted_currency_id: {
        type: DataTypes.INTEGER(20),
        allowNull: false
      },
      refund_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_credited: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: "0"
      },
      status: {
        type: DataTypes.ENUM("success", "pending", "withdraw"),
        allowNull: false,
        defaultValue: "success"
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
      tableName: "payments"
    }
  );

  Payments.associate = models => {
    Payments.belongsTo(models.Users, {
      foreignKey: "trip_user_id",
      targetKey: "id",
      as: "trip_user_details"
    });

    Payments.belongsTo(models.Users, {
      foreignKey: "requestor_id",
      targetKey: "id",
      as: "requester_details"
    });

    Payments.belongsTo(models.Trips, {
      foreignKey: "trip_id",
      targetKey: "id",
      as: "trip_details"
    });

    Payments.belongsTo(models.StripeCharges, {
      foreignKey: "strip_id",
      targetKey: "id",
      as: "stripe_charges"
    });

    Payments.belongsTo(models.Currency, {
      foreignKey: "currency_id",
      targetKey: "id",
      as: "currency"
    });
    Payments.belongsTo(models.Currency, {
      foreignKey: "converted_currency_id",
      targetKey: "id",
      as: "converted_currency"
    });
  };
  return Payments;
};
