/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    var phone_code_list = sequelize.define('phone_code_list', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement:true
      },
      phonecode: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        
      } ,
      iso: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: true
      }
     }, {
        timestamps: false,
        tableName: 'phone_code_list'
      });
  
    return phone_code_list;
  
  };
  