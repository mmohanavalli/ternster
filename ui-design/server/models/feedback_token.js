/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var FeedbackToken = sequelize.define('FeedbackToken', {
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
    trip_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    verification_token:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: false,
    tableName: 'feedback_token'
  });

  FeedbackToken.associate = (models) => {
    FeedbackToken.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

    FeedbackToken.belongsTo(models.Trips, {
      foreignKey: 'trip_id',
      targetKey: 'id'
    })
  }

  return FeedbackToken;
};
