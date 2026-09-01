const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

// ========================================
// EMPLOYEE DASHBOARD
// ========================================
const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // ==============================
    // GET EMPLOYEE
    // ==============================

    const employee = await User.findById(userId).select(
      "name email role createdAt"
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // ==============================
    // GET ASSIGNED PROJECTS
    // ==============================

    const projects = await Project.find({
      teamMembers: userId,
    })
      .populate("teamMembers", "name email")
      .sort({ createdAt: -1 });

    // ==============================
    // GET ASSIGNED TASKS
    // ==============================

    const tasks = await Task.find({
      assignedTo: userId,
    })
      .populate("project", "name status")
      .sort({
        completed: 1,
        dueDate: 1,
      });

    // ==============================
    // TASK COUNTS
    // ==============================

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.completed
    ).length;

    const pendingTasks =
      totalTasks - completedTasks;

    // ==============================
    // RESPONSE
    // ==============================

    res.json({
      employee,

      projects,

      tasks,

      stats: {
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    console.error(
      "Employee dashboard error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployeeDashboard,
};