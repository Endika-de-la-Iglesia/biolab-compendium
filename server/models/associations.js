const User = require("./User");
const Protocol = require("./Protocol");
const Favourite = require("./Favourite");
const Reaction = require("./Reaction");
const Reactive = require("./Reactive");

User.belongsToMany(Protocol, {
  through: Favourite,
  as: "Favourites",
  foreignKey: "user_id",
});
Protocol.belongsToMany(User, {
  through: Favourite,
  as: "Favourites",
  foreignKey: "protocol_id",
});

Protocol.hasMany(Reaction, { foreignKey: "protocol_id" });

Reaction.belongsTo(Protocol, { foreignKey: "protocol_id" });
Reaction.hasMany(Reactive, { foreignKey: "reaction_id" });

Reactive.belongsTo(Reaction, { foreignKey: "reaction_id" });

module.exports = { User, Protocol, Favourite, Reaction, Reactive };
