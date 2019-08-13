/* jshint indent: 2 */
var bcrypt = require("bcrypt");
module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      password_token: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      google_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      facebook_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      is_kyc_verified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      is_social_verified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      isVerified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      isSmsOtpVerified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      sms_otp_hashed_code: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      currency_id: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: "19"
      },
      status: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      is_blocked: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      },
      reduced_ratings: {
        type: DataTypes.DOUBLE(2),
        allowNull: false,
        defaultValue: "0"
      },
      blocked_from_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      blocked_to_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      blocked_type: {
        type: DataTypes.ENUM("temporary", "permanent"),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      timestamps: false,
      tableName: "users",
      hooks: {
        beforeCreate: user => {
          if (user.password != null) {
            const salt = bcrypt.genSaltSync(8);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        }
      }
    }
  );

  Users.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  Users.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  Users.prototype.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  };

  Users.associate = models => {
    Users.belongsTo(models.Profiles, {
      foreignKey: "id",
      targetKey: "user_id"
    });

    Users.hasMany(models.Trips, {
      foreignKey: "user_id",
      targetKey: "id"
    });

    Users.hasMany(models.Invites, {
      foreignKey: "user_id",
      targetKey: "id"
    });

    Users.hasMany(models.TripReviews, {
      foreignKey: "user_id",
      targetKey: "id"
    });

    Users.belongsTo(models.Settings, {
      foreignKey: "id",
      targetKey: "user_id"
    });

    Users.belongsTo(models.Currency, {
      foreignKey: "currency_id",
      targetKey: "id",
      as: "currency"
    });
  };

  return Users;
};
