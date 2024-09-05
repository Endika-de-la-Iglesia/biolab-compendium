const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const Reaction = require("./Reaction");

const Reactive = sequelize.define("Reactive", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    unique: true,
  },
  reaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Reaction,
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  initial_concentration_value: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  initial_concentration_units: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  final_concentration_value: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  final_concentration_units: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Reactive;
