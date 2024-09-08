const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Protocol = sequelize.define(
  "Protocol",
  {
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
    publication_state: {
      type: DataTypes.ENUM("Borrador", "Publicado"),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    objective: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    featured_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    confidential: {
      type: DataTypes.STRING,
      defaultValue: "no",
    },
    youtube_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "protocols",
    timestamps: true,
  }
);

module.exports = Protocol;
