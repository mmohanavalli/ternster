/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    var CompanionRequestors = sequelize.define('CompanionRequestors', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      assigned_trip_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      timestamps: false,
      tableName: 'companion_requestors'
    });

    CompanionRequestors.associate = (models) => {     
      CompanionRequestors.belongsTo(models.Users, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  
    return CompanionRequestors;
  };
  