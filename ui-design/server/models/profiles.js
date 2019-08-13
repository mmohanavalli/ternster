/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Profiles = sequelize.define('Profiles', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    home_town: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male','female'),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    languages: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    interest: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    kyc_link: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    kyc_status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    purpose_of_trip: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    about_me: {
      type: DataTypes.TEXT(),
      allowNull: true
    },
    facebook_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    twitter_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    instagram_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cover_picture: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    initial_login: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
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
    tableName: 'profiles'
  });

  Profiles.associate = (models) => {
    Profiles.belongsTo(models.Users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });       
  }

  return Profiles;
};
