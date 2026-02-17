const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ad_interest', {
    ad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'ad',
        key: 'id'
      }
    },
    interest_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'interest',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'ad_interest',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ad_id" },
          { name: "interest_id" },
        ]
      },
      {
        name: "interest_id",
        using: "BTREE",
        fields: [
          { name: "interest_id" },
        ]
      },
    ]
  });
};
