module.exports = function (sequelize, DataTypes) {
    var UserMessagesDelete = sequelize.define('UserMessagesDelete', {
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
      from_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      to_user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
    }, {
        timestamps: false,
        tableName: 'user_message_delete'
      });

      UserMessagesDelete.associate = (models) => {
        UserMessagesDelete.belongsTo(models.Messages, {
          foreignKey: 'user_id',
          targetKey: 'user_id'
        })
      }

    return UserMessagesDelete;
};
