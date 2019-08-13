/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  var Cities = sequelize.define(
    "Cities",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      cc_fips: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      cc_iso: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      full_name_nd: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      country_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
    },
    {
      timestamps: false,
      tableName: "cities",
      indexes: [
        {
          unique: true,
          fields: ["full_name_nd"]
        }
      ]
    }
  );
  return Cities;
};
