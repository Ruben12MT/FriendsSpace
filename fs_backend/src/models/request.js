const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "request",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "user", key: "id" },
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "user", key: "id" },
      },
      connection_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: { model: "connection", key: "id" },
      },
      is_report: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED"),
        allowNull: true,
        defaultValue: "PENDING",
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      info_report: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      visible_sender: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      visible_receiver: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_read_sender: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_read_receiver: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "request",
      timestamps: false,
      indexes: [
        { name: "PRIMARY", unique: true, using: "BTREE", fields: [{ name: "id" }] },
        { name: "sender_id", using: "BTREE", fields: [{ name: "sender_id" }] },
        { name: "receiver_id", using: "BTREE", fields: [{ name: "receiver_id" }] },
      ],
    }
  );
};