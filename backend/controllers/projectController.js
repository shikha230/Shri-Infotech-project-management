
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

    if (!Array.isArray(teamMembers)) {
      teamMembers = [];
    }

    if (!Array.isArray(technologies)) {
      technologies = [];
    }

    // ==============================
    // CREATE PROJECT
    // ==============================

    const project = await Project.create({
      name: name.trim(),

      description: description.trim(),

      status: status || "Planning",

      technologies,

      teamMembers,

      teamSize:
        Number(teamSize) || teamMembers.length,

      budget: Number(budget) || 0,

      startDate: startDate || undefined,

      endDate: endDate || undefined,

      documents,
    });

    // ==============================
    // RESPONSE
    // ==============================

    const populatedProject =
      await Project.findById(project._id).populate(
        "teamMembers",
        "name email"
      );

    res.status(201).json({
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Create project error:", error);

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
    const projects = await Project.find()
      .populate("teamMembers", "name email")
      .sort({
        createdAt: -1,
      });

    res.json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================
// GET MY PROJECTS
// EMPLOYEE
// ========================================
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
  teamMembers: req.user.userId,
})
  .select("-budget")
  .populate("teamMembers", "name email")
  .sort({ createdAt: -1 });

    res.json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get my projects error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamMembers", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error);

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
    let {
      technologies,
      teamMembers,
      documents,
      ...otherFields
    } = req.body;

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

    const updateData = {
      ...otherFields,
    };

    if (Array.isArray(technologies)) {
      updateData.technologies = technologies;
    }

    if (Array.isArray(teamMembers)) {
      updateData.teamMembers = teamMembers;
      updateData.teamSize = teamMembers.length;
    }

    if (Array.isArray(documents)) {
      updateData.documents = documents;
    }

    const project =
      await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate("teamMembers", "name email");

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
    console.error("Update project error:", error);

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
    // 1. FIND PROJECT
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
        console.error(
          `Failed to delete Cloudinary file: ${document.publicId}`,
          cloudinaryError
        );
      }
    }

    // ==========================================
    // 4. DELETE PROJECT
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
    console.error("Delete project error:", error);

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
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
};

