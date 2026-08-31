const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

// Admin password reset
router.post("/admin/forgot-password", forgotPassword);

router.post("/admin/reset-password", resetPassword);

module.exports = router;