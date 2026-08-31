const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE PROJECT
// ========================================
const createProject = async (req, res) => {
  try {
    let {
      name,
      description,
      status,
      technologies,
      teamSize,
      teamMembers,
      budget,
      startDate,
      endDate,
      documents,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Project description is required",
      });
    }

    // ==============================
    // PARSE TECHNOLOGIES
    // ==============================

    if (typeof technologies === "string") {
      try {
        technologies = JSON.parse(technologies);
      } catch {
        technologies = technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // ==============================
    // PARSE TEAM MEMBERS
    // ==============================

    if (typeof teamMembers === "string") {
      try {
        teamMembers = JSON.parse(teamMembers);
      } catch {
        teamMembers = teamMembers
          .split(",")
          .map((member) => member.trim())
          .filter(Boolean);
      }
    }

    // ==============================
    // PARSE DOCUMENTS
    // ==============================

    if (typeof documents === "string") {
      try {
        documents = JSON.parse(documents);
      } catch {
        documents = [];
      }
    }

    if (!Array.isArray(documents)) {
      documents = [];
    }

    // ==============================
    // CREATE PROJECT
    // ==============================

    const project = await Project.create({
      name: name.trim(),

      description: description.trim(),

      status: status || "Planning",

      technologies: Array.isArray(technologies)
        ? technologies
        : [],

      teamMembers: Array.isArray(teamMembers)
        ? teamMembers
        : [],

      teamSize:
        Number(teamSize) ||
        (Array.isArray(teamMembers)
          ? teamMembers.length
          : 0),

      budget: Number(budget) || 0,

      startDate: startDate || undefined,

      endDate: endDate || undefined,

      documents,
    });

    // ==============================
    // RESPONSE
    // ==============================

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Create project error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL PROJECTS
// ========================================
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(
      "Get projects error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE PROJECT
// ========================================
const updateProject = async (req, res) => {
  try {
    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Update project error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE PROJECT
// ========================================
const deleteProject = async (req, res) => {
  try {
    // ==========================================
    // 1. FIND PROJECT FIRST
    // ==========================================

    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ==========================================
    // 2. GET PROJECT DOCUMENTS
    // ==========================================

    const documents = project.documents || [];

    console.log(
      `Project has ${documents.length} document(s)`
    );

    // ==========================================
    // 3. DELETE DOCUMENTS FROM CLOUDINARY
    // ==========================================

    for (const document of documents) {
      if (!document.publicId) {
        console.log(
          "Skipping document without publicId:",
          document.name
        );

        continue;
      }

      try {
        console.log(
          "Deleting Cloudinary file:",
          document.publicId
        );

        // Use the resource type saved with the document.
        const resourceType =
          document.resourceType || "raw";

        const result =
          await cloudinary.uploader.destroy(
            document.publicId,
            {
              resource_type: resourceType,
            }
          );

        console.log(
          `Cloudinary delete result for ${document.name}:`,
          result
        );
      } catch (cloudinaryError) {
        // Don't immediately stop the entire deletion
        // if one Cloudinary file fails.
        console.error(
          `Failed to delete Cloudinary file: ${document.publicId}`,
          cloudinaryError
        );
      }
    }

    // ==========================================
    // 4. DELETE PROJECT FROM MONGODB
    // ==========================================

    await Project.findByIdAndDelete(
      req.params.id
    );

    // ==========================================
    // 5. SUCCESS RESPONSE
    // ==========================================

    res.json({
      message:
        "Project and associated documents deleted successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Delete project error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};