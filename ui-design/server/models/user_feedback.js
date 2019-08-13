/* jshint indent: 2 */
var bcrypt = require('bcrypt');
module.exports = function(sequelize, DataTypes) {
  var user_feedback = sequelize.define('user_feedback', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rate: {
      type: DataTypes.STRING(10),
      allowNull: false
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
    tableName: 'user_feedback',
    
  });
 
 
  return user_feedback;
};
