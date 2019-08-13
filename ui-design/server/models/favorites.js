/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  var Favorites = sequelize.define('Favorites', {
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
      timestamps: false,
      tableName: 'favorites'
    });

    Favorites.associate = function (models) {
      Favorites.belongsTo(models.Trips, {
      foreignKey: 'trip_id',
      targetKey: 'id'
    });

    Favorites.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

  }

  return Favorites;
};
