/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
	var CancelledActions = sequelize.define('CancelledActions', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement:true
		},
		name: {
			type: DataTypes.STRING(255),
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
		tableName: 'cancelled_actions'
	});

	return CancelledActions;
};
