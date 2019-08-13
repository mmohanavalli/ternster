/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  var Wallet = sequelize.define(
    "Wallet",
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
      pending_balance: {
        type: DataTypes.DOUBLE(2),
        allowNull: false,
        defaultValue: "0"
      },
      available_balance: {
        type: DataTypes.DOUBLE(2),
        allowNull: false,
        defaultValue: "0"
      },
      status: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "1"
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
      tableName: "wallet"
    }
  );

  Wallet.associate = models => {
    Wallet.belongsTo(models.Users, {
      foreignKey: "user_id",
      targetKey: "id",
      as: "user_details"
    });
  };
  return Wallet;
};
