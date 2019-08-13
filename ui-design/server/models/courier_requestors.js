/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var CourierRequestors = sequelize.define('CourierRequestors', {
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
    package_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    package_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    from_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    to_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    package_weight: {
      type: DataTypes.INTEGER(25),
      allowNull: true
    },
    weight_unit: {
      type: DataTypes.ENUM('kg', 'lb','oz'),
      allowNull: false,
      defaultValue: 'kg'
    },
    item_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    item_weight: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    item_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },   
    item_images: {
      type: DataTypes.STRING(255),
      allowNull: true
    },   
    size: {
      type: DataTypes.ENUM('small','medium','large'),
      allowNull: true
    },
    width: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    height: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    package_images: {
      type: DataTypes.STRING(255),
      allowNull: true
    }, 
    receiver_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }, 
    receiver_contact_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    }, 
    receiver_email_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    }, 
    receiver_otp: {
      type: DataTypes.STRING(50),
      allowNull: true
    },   
    trip_request_status: {
      type: DataTypes.ENUM('open', 'close'),
      allowNull: false,
      defaultValue: 'open'
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
    tableName: 'courier_requestors'
  });

  CourierRequestors.associate = (models) => {     
    CourierRequestors.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

    CourierRequestors.belongsTo(models.Invites, {
      foreignKey: 'id',
      targetKey: 'request_id'
    });
  }

  return CourierRequestors;
  
};
