const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  getMyTasks,
  toggleTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// ========================================
// CREATE TASK
// ========================================
router.post(
  "/",
  authMiddleware,
  createTask
);

// ========================================
// GET ALL TASKS
// ========================================
router.get(
  "/",
  authMiddleware,
  getTasks
);

// ========================================
// GET LOGGED-IN EMPLOYEE TASKS
// ========================================
router.get(
  "/my",
  authMiddleware,
  getMyTasks
);

// ========================================
// TOGGLE MY TASK
// ========================================
router.patch(
  "/:id/toggle",
  authMiddleware,
  toggleTask
);

// ========================================
// UPDATE TASK
// ========================================
router.put(
  "/:id",
  authMiddleware,
  updateTask
);

// ========================================
// DELETE TASK
// ========================================
router.delete(
  "/:id",
  authMiddleware,
  deleteTask
);

module.exports = router;