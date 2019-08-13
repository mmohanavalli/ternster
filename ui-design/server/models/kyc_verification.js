/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    var kyc_verifications = sequelize.define('kyc_verification', {
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
      user_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      resource: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false
      },     
      documentnumber: {
        type: DataTypes.STRING(255),
        allowNull: false
      },   
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
        timestamps: false,
      tableName: 'kyc_verification_details'
    });
  
  
  
    return kyc_verifications;
  };
  