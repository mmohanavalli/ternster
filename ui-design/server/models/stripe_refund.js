/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var StripeRefund = sequelize.define(
    "StripeRefund",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      stripe_charge_id: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      refund_charge_id: {
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
      tableName: "stripe_refund",
      timestamps: false
    }
  );
  StripeRefund.associate = models => {
    StripeRefund.belongsTo(models.StripeCharges, {
      foreignKey: "stripe_charge_id",
      targetKey: "id",
      as: "stripe_charges"
    });
  };
  return StripeRefund;
};
