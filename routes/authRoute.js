
// const express = require("express");
// const {
//   register,
//   login,
//   refresh,
//   logout,
//   getMe,
// } = require("../controllers/authController.js");
// const { verifyToken } = require("../middlewares/authMiddleware.js");

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.post("/refresh", refresh);
// router.post("/logout", logout);
// router.get("/me", verifyToken, getMe);

// module.exports = router;
///////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require("../controllers/authController.js");
const {
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/passwordResetController.js");
const { verifyToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

module.exports = router;


