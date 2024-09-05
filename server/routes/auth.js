const express = require("express");
const router = express.Router();
const {
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
  updateEmail
} = require("../controllers/authController");

const {
  authenticate,
  authorizeAdmin,
} = require("../controllers/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

// protected
router.get("/user/:userId", authenticate, checkUserById);
router.get("/users", authenticate, authorizeAdmin, getAllUsers);
router.get("/users/:userId", authenticate, authorizeAdmin, getUserById);

router.patch(
  "/users/update-role/:userId",
  authenticate,
  authorizeAdmin,
  updateUserRole
);

router.delete(
  "/delete-user/:userId",
  authenticate,
  deleteUser
);

router.patch("/change-password/:userId", authenticate, changePassword);
router.patch("/update-username/:userId", authenticate, updateUsername);
router.patch("/update-email/:userId", authenticate, updateEmail);

module.exports = router;
