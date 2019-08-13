module.exports = function(sequelize, DataTypes) {
    var LikedComment = sequelize.define('LikedComment', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      comment_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      trip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
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
      tableName: 'liked_comment',
      timestamps: false
    });
  
    LikedComment.associate = (models) => {
        LikedComment.belongsTo(models.Users, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
  
      LikedComment.belongsTo(models.Trips, {
        foreignKey: 'trip_id',
        targetKey: 'id'
      });

      LikedComment.belongsTo(models.Comments, {
        foreignKey: 'comment_id',
        targetKey: 'id'
      })
    }
    
    return LikedComment;
  };