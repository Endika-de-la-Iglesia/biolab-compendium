const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getProtocols,
  getProtocolById,
  createProtocol,
  updateProtocol,
  deleteProtocol,
  addProtocolToFavourite,
  deleteProtocolFromFavourite,
  isProtocolFavourite,
  protocolQuillImageDeletion,
  protocolQuillImageUpload,
} = require("../controllers/protocolController");
const {
  authenticate,
  authorizeAdmin,
} = require("../controllers/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get("/", getProtocols);
router.get("/:protocolId", getProtocolById);

// Protected (only authenticated users)
router.post("/favourite", authenticate, addProtocolToFavourite);
router.delete("/favourite", authenticate, deleteProtocolFromFavourite);
router.post("/favourite/check", authenticate, isProtocolFavourite);

// Protected (admin only)
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  upload.single("featured_image"),
  createProtocol
);
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  upload.single("featured_image"),
  updateProtocol
);
router.delete("/:id", authenticate, authorizeAdmin, deleteProtocol);

router.post(
  "/upload_protocol_img",
  authenticate,
  authorizeAdmin,
  upload.single("file"),
  protocolQuillImageUpload
);

router.post(
  "/delete_protocol_img",
  authenticate,
  authorizeAdmin,
  protocolQuillImageDeletion
);

module.exports = router;
