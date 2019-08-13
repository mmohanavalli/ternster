/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var TernsterAccounts =  sequelize.define('TernsterAccounts', {
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
    account_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ifsc_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    account_holder_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bank_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bank_address: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'ternster_accounts'
  });

  return TernsterAccounts;
};
