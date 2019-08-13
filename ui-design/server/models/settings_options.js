/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var SettingsOptions = sequelize.define('SettingsOptions', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    name: {
      type: DataTypes.ENUM('RegisteredUsers','VerifiedUsers'),
      allowNull: false,
      defaultValue: 'RegisteredUsers'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: false,
    tableName: 'settings_options'
  });

  return SettingsOptions;
};
