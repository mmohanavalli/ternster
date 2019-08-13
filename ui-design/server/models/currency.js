/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  var Currency = sequelize.define(
    "Currency",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      symbol: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      minimum_amount: {
        type: DataTypes.INTEGER(10)
      },
      maximum_amount: {
        type: DataTypes.INTEGER(10)
      },   currency_rate: {
        type: DataTypes.DECIMAL()
      },
    is_default: {
        type: DataTypes.INTEGER(1),
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
      timestamps: false,
      tableName: "currency"
    }
  );
  return Currency;
};
