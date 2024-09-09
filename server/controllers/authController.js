const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
require("dotenv").config();

const companyDomains = {
  Google: "gmail.com",
};

function validateEmailDomain(email, selectedCompany) {
  const domain = email.split("@")[1];
  return domain === companyDomains[selectedCompany];
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = (email, token) => {
  const verificationUrl = `${process.env.API_URL}/api/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Registro en BioLab Compendium || Verificación de email",
    text: `Por favor, verifica tu email pulsando en el siguiente enlace: ${verificationUrl}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error enviando el email de verificación:", err);
    } else {
      console.log("Email de verificación enviado:", info.response);
    }
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password, company } = req.body;

    if (!username || !email || !password || !company) {
      return res
        .status(400)
        .json({ error: "Es necesario rellenar todos los apartados." });
    }

    if (company !== "no" && !validateEmailDomain(email, company)) {
      return res
        .status(400)
        .json({ error: "Email inválido para la compañía seleccionada." });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&¿!#^])[A-Za-z\d@$!%*?&¿!#^]{10,100}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "La contraseña tiene que tener entre 10 y 100 caracteres, contener al menos un número, una letra y un carácter especial.",
      });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario ya está en uso." });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "El email ya está en uso." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      company,
      verified: false,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    sendVerificationEmail(user.email, token);

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Se requieren email y contraseña." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.verified) {
      return res.status(400).json({
        error: "Email o contraseña inválido, o no se ha verificado el email.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Email o contraseñas inválidos." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company: user.company,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(400).json({ error: "Token inválido." });
    }

    user.verified = true;
    await user.save();

    res.redirect(process.env.FRONT_END_URL);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado, solo pueden acceder los administradores.",
      });
    }

    const users = await User.findAll({
      attributes: ["username", "email", "role", "id"],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado, solo pueden acceder los administradores.",
      });
    }

    const users = await User.findAll({
      attributes: ["username", "email", "role", "id"],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error:
          "Acceso denegado, solo los administradores pueden actualizar los roles de los usuarios",
      });
    }

    const { userId } = req.params;
    const { newRole } = req.body;

    if (newRole !== "user" && newRole !== "admin") {
      return res.status(400).json({
        error:
          'Rol inválido, los usuarios tienen que tener un rol de "user" o de "admin".',
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    user.role = newRole;
    await user.save();

    res.json({ message: "Rol de usuario actualizado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({
        error:
          "Acceso denegado, solo los administradores o el propio usuario pueden eliminar una cuenta.",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    await user.destroy();

    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body.passwordField;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Se requiren las contraseñas antigua y nueva." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res
        .status(400)
        .json({ error: "La contraseña antigua no es correcta." });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-={}\[\]|\\:;'",.<>/?`~])[A-Za-z\d@$!%*?&^#()_+\-={}\[\]|\\:;'",.<>/?`~]{10,100}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "La contraseña nueva tiene que tener entre 10 y 100 caracteres, contener al menos un número, una letra y un carácter especial.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body.usernameField;
    const userId = req.user.id;

    if (!newUsername) {
      return res.status(400).json({ error: "Se requiere nuevo usuario." });
    }

    const existingUsername = await User.findOne({
      where: { username: newUsername },
    });
    if (existingUsername) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario ya está en uso." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    user.username = newUsername;
    await user.save();

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company: user.company,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, message: "Usuario actualizado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { newEmail, company } = req.body.emailField;
    const userId = req.user.id;

    if (!newEmail) {
      return res.status(400).json({ error: "Se requiere nuevo email." });
    }

    if (company !== "no" && !validateEmailDomain(newEmail, company)) {
      return res.status(400).json({
        error: "Email inválido para la compañía seleccionada.",
      });
    }

    const existingEmail = await User.findOne({ where: { email: newEmail } });
    if (existingEmail) {
      return res.status(400).json({ error: "El email ya está en uso." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    user.email = newEmail;
    user.verified = false;
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    try {
      await sendVerificationEmail(user.email, token);
      res.json({ message: "Email actualizado correctamente." });
    } catch (error) {
      console.error("Error enviando el mensaje de verificación:", error);
      res.status(500).json({ error: "Fallo enviando email de verificación." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  getAllUsers,
  getUserById,
  checkUserById,
  updateUserRole,
  deleteUser,
  changePassword,
  updateUsername,
  updateEmail,
};
