/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var AssistantRequestors = sequelize.define('AssistantRequestors', {
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
    departure: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    destination: {
      type: DataTypes.STRING(100),
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
    members: {
      type: DataTypes.INTEGER(25),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    requested: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    package_status: {
      type: DataTypes.ENUM('created', 'assigned','delivered'),
      allowNull: false,
      defaultValue: 'created'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: false,
    tableName: 'assistant_requestors'
  });

  AssistantRequestors.associate = (models) => {     
    AssistantRequestors.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });
  }

  return AssistantRequestors;
};
