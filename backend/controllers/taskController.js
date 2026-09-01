const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// ========================================
// CREATE TASK
// ========================================
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      project,
      priority,
      status,
      dueDate,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        message: "Employee is required",
      });
    }

    if (!project) {
      return res.status(400).json({
        message: "Project is required",
      });
    }

    // ==============================
    // CHECK EMPLOYEE
    // ==============================

    const employee = await User.findById(assignedTo);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (employee.role !== "employee") {
      return res.status(400).json({
        message: "Selected user is not an employee",
      });
    }

    // ==============================
    // CHECK PROJECT
    // ==============================

    const projectData = await Project.findById(project);

    if (!projectData) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ==============================
    // CHECK EMPLOYEE IN PROJECT
    // ==============================

    const isAssignedToProject =
      Array.isArray(projectData.teamMembers) &&
      projectData.teamMembers.some((member) => {
        const memberId =
          typeof member === "object"
            ? member._id
            : member;

        return memberId?.toString() === assignedTo.toString();
      });

    if (!isAssignedToProject) {
      return res.status(400).json({
        message:
          "This employee is not assigned to the selected project",
      });
    }

    // ==============================
    // CREATE TASK
    // ==============================

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      assignedTo,
      project,
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate: dueDate || null,
      createdBy: req.user.userId,
    });

    // ==============================
    // POPULATE
    // ==============================

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name status")
      

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};
// GET ALL TASKS
// ADMIN
// ========================================
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("project", "name status")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// GET MY TASKS
// EMPLOYEE
// ========================================
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.userId,
    })
      .populate("project", "name status startDate endDate")
      .sort({ createdAt: -1 });

    res.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get my tasks error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// TOGGLE TASK
// EMPLOYEE
// ========================================
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Convert both to strings for proper comparison
    const assignedToId = task.assignedTo ? task.assignedTo.toString() : null;
    const userId = req.user?.userId ? req.user.userId.toString() : null;

    if (!userId || assignedToId !== userId) {
      console.error(`Permission denied: assignedTo=${assignedToId}, userId=${userId}`);
      return res.status(403).json({
        message: "You are not allowed to update this task",
      });
    }

    const allowedStatuses = ["Pending", "In Progress", "Completed"];
    const requestedStatus = req.body?.status;

    if (requestedStatus && !allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    task.status = requestedStatus ||
      (task.status === "Completed" ? "Pending" : task.status === "Pending" ? "In Progress" : "Completed");

    await task.save();

    const project = await Project.findById(task.project);

    if (project) {
      const allProjectTasks = await Task.find({ project: task.project });
      const completedProjectTasks = allProjectTasks.filter(
        (item) => item.status === "Completed"
      ).length;

      if (allProjectTasks.length === 0) {
        project.status = "Planning";
      } else if (completedProjectTasks === allProjectTasks.length) {
        project.status = "Completed";
      } else if (completedProjectTasks > 0) {
        project.status = "In Progress";
      } else {
        project.status = "Planning";
      }

      await project.save();
    }

    const updatedTask = await Task.findById(task._id)
      .populate("project", "name status startDate endDate")
      .populate("assignedTo", "name email");

    res.json({
      message: `Task marked as ${task.status}`,
      task: updatedTask,
      projectStatus: project?.status || "Planning",
    });
  } catch (error) {
    console.error("Toggle task error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE TASK
// ADMIN
// ========================================
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("assignedTo", "name email")
      .populate("project", "name status");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE TASK
// ADMIN
// ========================================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  toggleTask,
  updateTask,
  deleteTask,
};