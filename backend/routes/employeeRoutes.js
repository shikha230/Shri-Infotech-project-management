const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getEmployeeDashboard,
} = require("../controllers/employeeController");

// ========================================
// EMPLOYEE DASHBOARD
// ========================================

router.get(
  "/dashboard",
  authMiddleware,
  getEmployeeDashboard
);

module.exports = router;