const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // ==============================
    // TASK TITLE
    // ==============================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ==============================
    // TASK DESCRIPTION
    // ==============================
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ==============================
    // PROJECT
    // ==============================
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // ==============================
    // ASSIGNED EMPLOYEE
    // ==============================
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==============================
    // PRIORITY
    // ==============================
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // ==============================
    // CREATED BY
    // ==============================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==============================
    // STATUS
    // ==============================
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    // ==============================
    // DUE DATE
    // ==============================
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);