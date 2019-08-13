/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Comments = sequelize.define('Comments', {
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_reply_msg: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    reply_to_msg_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    is_liked: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'comments',
    timestamps: false
  });

  Comments.associate = (models) => {
    Comments.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

    Comments.belongsTo(models.Trips, {
      foreignKey: 'trip_id',
      targetKey: 'id'
    });

    // Comments.belongsTo(models.LikedComment, {
    //   foreignKey: 'trip_id',
    //   targetKey: 'trip_id'
    // })
  }
  
  return Comments;
};
