/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  var Messages = sequelize.define('Messages', {
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
    user_name: {
      type: DataTypes.STRING(100),
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_delete: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: false,
      defaultValue: 'false'
    },
    trip_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    view_status: {
      type: DataTypes.ENUM('read', 'unread'),
      allowNull: false,
      defaultValue: 'unread'
    },
    chat_view_status_by_from_user: {
      type: DataTypes.ENUM('read', 'unread'),
      allowNull: false,
      defaultValue: 'unread'
    }, 
    chat_view_status_by_to_user: {
      type: DataTypes.ENUM('read', 'unread'),
      allowNull: false,
      defaultValue: 'unread'
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
      tableName: 'messages'
    });

  Messages.associate = (models) => {
    Messages.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    })
    // Messages.hasMany(models.Invites, {
    //   foreignKey: 'user_id',
    //   targetKey: 'id'
    // }); 

    Messages.belongsTo(models.Invites, {
      foreignKey: 'id',
      targetKey: 'user_id'
    });
  }

  return Messages;
};
