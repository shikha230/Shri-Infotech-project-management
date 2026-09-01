const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Planning",
        "In Progress",
        "Completed",
        "On Hold",
      ],
      default: "Planning",
    },

    technologies: {
      type: [String],
      default: [],
    },

    // ==============================
    // ASSIGNED EMPLOYEES
    // ==============================
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    teamSize: {
      type: Number,
      default: 0,
    },

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==============================
    // PROJECT DOCUMENTS
    // ==============================
    documents: [
      {
        name: {
          type: String,
          required: true,
        },

        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },

        type: {
          type: String,
          default: "",
        },

        size: {
          type: Number,
          default: 0,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);