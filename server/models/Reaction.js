const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const Protocol = require("./Protocol");

const Reaction = sequelize.define("Reaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  protocol_id: {
    type: DataTypes.UUID,
    references: {
      model: Protocol,
      key: "id",
    },
    allowNull: false,
  },
  reaction_volume_value: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  reaction_volume_units: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  solvent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Reaction.belongsTo(Protocol, { foreignKey: "protocol_id" });
Protocol.hasMany(Reaction, { foreignKey: "protocol_id" });

module.exports = Reaction;
