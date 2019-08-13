/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var StripeCharges = sequelize.define(
    "StripeCharges",
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
      stripe_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      trip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      charge_id: {
        type: DataTypes.STRING(255),
        allowNull: false
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
      tableName: "stripe_charges",
      timestamps: false
    }
  );
  StripeCharges.associate = models => {
    StripeCharges.belongsTo(models.Trips, {
      foreignKey: "trip_id",
      targetKey: "id",
      as: "trip_details"
    });
  };
  return StripeCharges;
};
