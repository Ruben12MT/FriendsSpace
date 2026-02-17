const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_connection', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    connection_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'connection',
        key: 'id'
      }
    },
    blocked_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'user_connection',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
          { name: "connection_id" },
        ]
      },
      {
        name: "connection_id",
        using: "BTREE",
        fields: [
          { name: "connection_id" },
        ]
      },
      {
        name: "blocked_by",
        using: "BTREE",
        fields: [
          { name: "blocked_by" },
        ]
      },
    ]
  });
};
