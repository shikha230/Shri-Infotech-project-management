const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// CREATE PROJECT
router.post(
  "/",
  authMiddleware,
  createProject
);

// GET PROJECTS
router.get(
  "/",
  authMiddleware,
  getProjects
);

// UPDATE PROJECT
router.put(
  "/:id",
  authMiddleware,
  updateProject
);

// DELETE PROJECT
router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);

module.exports = router;