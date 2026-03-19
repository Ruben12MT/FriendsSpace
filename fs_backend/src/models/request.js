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
        references: {
          model: "user",
          key: "id",
        },
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
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
      // AGREGAMOS LA COLUMNA MANUALMENTE AQUÍ:
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        // Si en la base de datos se llena sola, no necesitas defaultValue aquí
      },
    },
    {
      sequelize,
      tableName: "request",
      timestamps: false, // Lo dejamos en false como querías
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "sender_id",
          using: "BTREE",
          fields: [{ name: "sender_id" }],
        },
        {
          name: "receiver_id",
          using: "BTREE",
          fields: [{ name: "receiver_id" }],
        },
      ],
    }
  );
};