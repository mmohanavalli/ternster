module.exports = function (sequelize, DataTypes) {
    var FavoriteUser = sequelize.define('FavoriteUser', {
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
      fav_user_id: {
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
        tableName: 'favorite_user'
      });
  
      FavoriteUser.associate = function (models) {
        FavoriteUser.belongsTo(models.Users, {
          foreignKey: 'user_id',
          targetKey: 'id'
        });

      FavoriteUser.belongsTo(models.Profiles, {
        foreignKey: "fav_user_id",
        targetKey: "user_id"
      });

      FavoriteUser.belongsTo(models.Settings, {
        foreignKey: "fav_user_id",
        targetKey: "user_id"
      });

      FavoriteUser.belongsTo(models.Invites, {
        foreignKey: "fav_user_id",
        targetKey: "user_id"
      });
  
    }
  
    return FavoriteUser;
  };
  