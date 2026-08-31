const express = require("express");
const multer = require("multer");

const router = express.Router();

const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const Project = require("../models/Project");

// =====================================================
// MULTER CONFIG
// =====================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// =====================================================
// UPLOAD FILE
// POST /api/upload
// =====================================================

router.post(
  "/",
  authMiddleware,

  (req, res, next) => {
    console.log("1. Upload request reached route");
    next();
  },

  upload.single("file"),

  async (req, res) => {
    try {
      console.log("2. Multer finished");

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      console.log("3. File received:", {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      });

      console.log("4. Starting Cloudinary upload...");

      const uploadResult = await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "crm-project-files",
                resource_type: "auto",
                use_filename: true,
                unique_filename: true,
              },

              (error, result) => {
                if (error) {
                  console.error(
                    "5. Cloudinary error:",
                    error
                  );

                  reject(error);
                } else {
                  console.log(
                    "5. Cloudinary upload successful"
                  );

                  console.log({
                    public_id: result.public_id,
                    resource_type:
                      result.resource_type,
                    secure_url:
                      result.secure_url,
                  });

                  resolve(result);
                }
              }
            );

          stream.on("error", (error) => {
            console.error(
              "Cloudinary stream error:",
              error
            );

            reject(error);
          });

          stream.end(req.file.buffer);
        }
      );

      return res.status(201).json({
        message: "File uploaded successfully",

        file: {
          name: req.file.originalname,
          url:
            uploadResult.secure_url ||
            uploadResult.url,
          publicId: uploadResult.public_id,
          type: req.file.mimetype,
          size: req.file.size,
          resourceType:
            uploadResult.resource_type,
        },
      });
    } catch (error) {
      console.error(
        "File upload error:",
        error
      );

      const isCloudinaryConfigError =
        error.http_code === 401 &&
        error.message
          ?.toLowerCase()
          .includes("cloud_name");

      return res.status(
        isCloudinaryConfigError ? 503 : 500
      ).json({
        message: isCloudinaryConfigError
          ? "Cloudinary is not configured correctly."
          : "File upload failed",

        error: error.message,
      });
    }
  }
);

// =====================================================
// DELETE DOCUMENT
// DELETE /api/upload
// =====================================================

router.delete(
  "/",
  authMiddleware,

  async (req, res) => {
    try {
      const { projectId, publicId } = req.body;

      console.log("Delete document request:", {
        projectId,
        publicId,
      });

      // ==========================================
      // VALIDATION
      // ==========================================

      if (!projectId) {
        return res.status(400).json({
          message: "Project ID is required.",
        });
      }

      if (!publicId) {
        return res.status(400).json({
          message: "Document public ID is required.",
        });
      }

      // ==========================================
      // FIND PROJECT
      // ==========================================

      const project = await Project.findById(
        projectId
      );

      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      // ==========================================
      // CHECK DOCUMENT EXISTS
      // ==========================================

      const documents =
        project.documents || [];

      const documentExists =
        documents.some(
          (document) =>
            document.publicId === publicId
        );

      if (!documentExists) {
        return res.status(404).json({
          message:
            "Document not found in this project.",
        });
      }

      // ==========================================
      // DELETE FROM CLOUDINARY
      // ==========================================

      console.log(
        "Deleting from Cloudinary:",
        publicId
      );

      const cloudinaryResult =
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: "raw",
          }
        );

      console.log(
        "Cloudinary delete result:",
        cloudinaryResult
      );

      // ==========================================
      // REMOVE DOCUMENT FROM PROJECT
      // ==========================================

      project.documents =
        documents.filter(
          (document) =>
            document.publicId !== publicId
        );

      await project.save();

      // ==========================================
      // SUCCESS
      // ==========================================

      return res.status(200).json({
        message:
          "Document deleted successfully.",

        cloudinary: cloudinaryResult,
      });
    } catch (error) {
      console.error(
        "Delete document error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete document.",

        error: error.message,
      });
    }
  }
);

module.exports = router;