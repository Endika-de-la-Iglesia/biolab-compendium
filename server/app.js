const express = require("express");
const cors = require("cors");
const sequelize = require("./models/index");
require("./models/associations");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

sequelize.sync({ alter: true }).then(() => {
  console.log("Comunicación de base de datos y tablas establecida");
});

app.get("/", (req, res) => {
  res.send("app express comunicándose");
});

app.use("/api/protocols", require("./routes/protocols"));
app.use("/api/auth", require("./routes/auth"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


