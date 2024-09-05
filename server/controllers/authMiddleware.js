const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "No se ha proporcionado encabezado de autorización" });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Cuenta de usuario eliminada o inexistente" });
    }
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
