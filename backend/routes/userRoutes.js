const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createEmployee,
  getUsers,
  getEmployees,
} = require("../controllers/userController");

// ========================================
// CREATE EMPLOYEE
// ADMIN ONLY
// ========================================

router.post(
  "/employees",
  authMiddleware,
  adminMiddleware,
  createEmployee
);

// ========================================
// GET ALL EMPLOYEES
// ========================================

router.get(
  "/employees",
  authMiddleware,
  getEmployees
);

// ========================================
// GET ALL NON-ADMIN USERS
// ========================================

router.get(
  "/",
  authMiddleware,
  getUsers
);

module.exports = router;