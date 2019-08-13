/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var TripReviews = sequelize.define('TripReviews', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    trip_id: {
      type: DataTypes.INTEGER(11),
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
    is_approved: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    rating: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: false,
    tableName: 'trip_reviews'
  });

  TripReviews.associate = (models) => {
    TripReviews.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

    TripReviews.belongsTo(models.Trips, {
      foreignKey: 'trip_id',
      targetKey: 'id'
    })
  }

  return TripReviews;
};
