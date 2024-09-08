const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const User = require("./User");
const Protocol = require("./Protocol");

const Favourite = sequelize.define(
  "Favourite",
  {
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    protocol_id: {
      type: DataTypes.UUID,
      references: {
        model: Protocol,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    tableName: "favourites",
    timestamps: true,
  }
);

module.exports = Favourite;
