import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function AdminProjects() {
  // =========================
  // SIDEBAR
  // =========================

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================
  // PROJECT STATES
  // =========================

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // =========================
  // DOCUMENT STATES
  // =========================

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  // =========================
  // EXPANDED PROJECT
  // =========================

  const [expandedId, setExpandedId] = useState(null);

  // =========================
  // EDIT FORM
  // =========================

  const initialEditForm = {
    name: "",
    description: "",
    status: "Planning",
    technologies: "",
    teamSize: 1,
    teamMembers: "",
    budget: "",
    startDate: "",
    endDate: "",
    documents: [],
  };

  const [editForm, setEditForm] = useState(initialEditForm);

  // =========================
  // FETCH PROJECTS
  // =========================

  useEffect(() => {
    fetchProjects();
  }, []);

  const getProjectDeadlineInfo = (project) => {
    if (!project?.endDate || project.status === "Completed") {
      return null;
    }

    const endDate = new Date(project.endDate);

    if (Number.isNaN(endDate.getTime())) {
      return null;
    }

    const timeLeft = endDate.getTime() - Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (timeLeft < 0 || timeLeft > oneDayMs) {
      return null;
    }

    const totalHours = Math.max(
      1,
      Math.ceil(timeLeft / (1000 * 60 * 60))
    );

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    const timeText =
      days > 0
        ? `${days} day${days > 1 ? "s" : ""} ${hours} hour${hours !== 1 ? "s" : ""}`
        : `${hours} hour${hours !== 1 ? "s" : ""}`;

    return {
      projectId: project._id,
      name: project.name || "Untitled project",
      timeText,
      dueDate: new Date(project.endDate).toLocaleDateString(),
    };
  };

  const deadlineWarnings = projects
    .map((project) => getProjectDeadlineInfo(project))
    .filter(Boolean);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET PROJECT DOCUMENTS
  // =========================

  const getProjectDocuments = (project) => {
    if (
      Array.isArray(project?.documents) &&
      project.documents.length > 0
    ) {
      return project.documents;
    }

    // Backward compatibility
    if (project?.file?.url) {
      return [project.file];
    }

    return [];
  };

  // =========================
  // PREVIEW DOCUMENT
  // =========================

  const handlePreviewDocument = (document) => {
    if (!document?.url) {
      alert("Document URL not available.");
      return;
    }

    setPreviewDocument(document);
  };

  // =========================
  // CLOSE PREVIEW
  // =========================

  const closePreview = () => {
    setPreviewDocument(null);
  };

  // =========================
  // EXPAND / COLLAPSE
  // =========================

  const toggleProject = (id) => {
    if (editingId === id) return;

    setExpandedId((currentId) =>
      currentId === id ? null : id
    );
  };

  // =========================
  // START EDITING
  // =========================

  const handleEdit = (project) => {
    const documents = getProjectDocuments(project);

    setEditingId(project._id);
    setExpandedId(project._id);

    setSelectedFile(null);
    setDeletingDocument(null);

    setEditForm({
      name: project.name || "",

      description: project.description || "",

      status: project.status || "Planning",

      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : "",

      teamSize: project.teamSize || 1,

      teamMembers: Array.isArray(project.teamMembers)
        ? project.teamMembers.join(", ")
        : "",

      budget:
        project.budget !== undefined &&
        project.budget !== null
          ? project.budget
          : "",

      startDate: project.startDate
        ? new Date(project.startDate)
            .toISOString()
            .split("T")[0]
        : "",

      endDate: project.endDate
        ? new Date(project.endDate)
            .toISOString()
            .split("T")[0]
        : "",

      documents,
    });

    setTimeout(() => {
      document
        .getElementById(`project-${project._id}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  };

  // =========================
  // EDIT INPUT CHANGE
  // =========================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================
  // FILE CHANGE
  // =========================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");

      e.target.value = "";

      return;
    }

    setSelectedFile(file);
  };

  // =========================
  // REMOVE SELECTED FILE
  // =========================

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  // =========================
  // DELETE EXISTING DOCUMENT
  // =========================

  const handleDeleteDocument = async (document) => {
    if (!editingId) {
      alert("Please edit the project before deleting a document.");
      return;
    }

    if (!document?.publicId) {
      alert(
        "This document cannot be deleted because it does not have a Cloudinary public ID."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.name || "this document"}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingDocument(document.publicId);

      // =========================
      // DELETE FROM BACKEND
      // =========================

      await api.delete("/upload", {
        data: {
          projectId: editingId,
          publicId: document.publicId,
        },
      });

      // =========================
      // REMOVE FROM EDIT FORM
      // =========================

      setEditForm((current) => ({
        ...current,

        documents: current.documents.filter(
          (item) => item.publicId !== document.publicId
        ),
      }));

      // =========================
      // UPDATE PROJECT LIST
      // =========================

      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project._id !== editingId) {
            return project;
          }

          const currentDocuments =
            getProjectDocuments(project);

          return {
            ...project,

            documents: currentDocuments.filter(
              (item) => item.publicId !== document.publicId
            ),
          };
        })
      );

      alert("Document deleted successfully.");
    } catch (error) {
      console.error(
        "Delete document error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete document."
      );
    } finally {
      setDeletingDocument(null);
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedFile(null);
    setUploadingFile(false);
    setDeletingDocument(null);

    setEditForm(initialEditForm);
  };

  // =========================
  // SAVE EDIT
  // =========================

  const handleSave = async (id) => {
    if (!editForm.name.trim()) {
      alert("Project name is required.");
      return;
    }

    if (!editForm.description.trim()) {
      alert("Project description is required.");
      return;
    }

    if (
      editForm.teamSize !== "" &&
      Number(editForm.teamSize) < 1
    ) {
      alert("Team size must be at least 1.");
      return;
    }

    try {
      setSaving(id);

      let uploadedDocument = null;

      // =========================
      // UPLOAD NEW DOCUMENT
      // =========================

      if (selectedFile) {
        try {
          setUploadingFile(true);

          const formData = new FormData();

          formData.append("file", selectedFile);

          const uploadResponse = await api.post(
            "/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          uploadedDocument =
            uploadResponse.data?.file || null;
        } finally {
          setUploadingFile(false);
        }
      }

      // =========================
      // PREPARE TECHNOLOGIES
      // =========================

      const technologies = editForm.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // =========================
      // PREPARE TEAM MEMBERS
      // =========================

      const teamMembers = editForm.teamMembers
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean);

      // =========================
      // PREPARE DOCUMENTS
      // =========================

      let documents = Array.isArray(editForm.documents)
        ? [...editForm.documents]
        : [];

      if (uploadedDocument) {
        documents.push(uploadedDocument);
      }

      // =========================
      // PROJECT DATA
      // =========================

      const updatedData = {
        name: editForm.name.trim(),

        description: editForm.description.trim(),

        status: editForm.status,

        technologies,

        teamSize: Number(editForm.teamSize) || 1,

        teamMembers,

        budget: Number(editForm.budget) || 0,

        documents,
      };

      // =========================
      // DATES
      // =========================

      if (editForm.startDate) {
        updatedData.startDate = editForm.startDate;
      } else {
        updatedData.startDate = null;
      }

      if (editForm.endDate) {
        updatedData.endDate = editForm.endDate;
      } else {
        updatedData.endDate = null;
      }

      // =========================
      // UPDATE PROJECT
      // =========================

      const response = await api.put(
        `/projects/${id}`,
        updatedData
      );

      const updatedProject =
        response.data?.project;

      if (!updatedProject) {
        throw new Error(
          "Updated project was not returned by the server."
        );
      }

      // =========================
      // UPDATE LOCAL STATE
      // =========================

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project._id === id
            ? updatedProject
            : project
        )
      );

      // =========================
      // RESET
      // =========================

      setSelectedFile(null);
      setUploadingFile(false);
      setEditingId(null);
      setExpandedId(null);
      setEditForm(initialEditForm);
    } catch (error) {
      console.error(
        "Update project error:",
        error
      );

      setUploadingFile(false);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update project."
      );
    } finally {
      setSaving(null);
    }
  };

  // =========================
  // DELETE PROJECT
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await api.delete(`/projects/${id}`);

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project._id !== id
        )
      );

      if (editingId === id) {
        handleCancelEdit();
      }

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete project."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredProjects = projects.filter(
    (project) => {
      const searchText = search
        .toLowerCase()
        .trim();

      if (!searchText) {
        return true;
      }

      const projectName =
        project.name?.toLowerCase() || "";

      const description =
        project.description?.toLowerCase() || "";

      const status =
        project.status?.toLowerCase() || "";

      const technologies = Array.isArray(
        project.technologies
      )
        ? project.technologies
        : [];

      const teamMembers = Array.isArray(
        project.teamMembers
      )
        ? project.teamMembers
        : [];

      return (
        projectName.includes(searchText) ||
        description.includes(searchText) ||
        status.includes(searchText) ||
        technologies.some((technology) =>
          String(technology)
            .toLowerCase()
            .includes(searchText)
        ) ||
        teamMembers.some((member) =>
          String(member)
            .toLowerCase()
            .includes(searchText)
        )
      );
    }
  );

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 border border-blue-100";
    }

    if (status === "On Hold") {
      return "bg-amber-50 text-amber-700 border border-amber-100";
    }

    return "bg-slate-100 text-slate-600 border border-slate-200";
  };

  // =========================
  // DOCUMENT TYPE HELPERS
  // =========================

  const isPdf = (document) => {
    const type = document?.type?.toLowerCase() || "";
    const name = document?.name?.toLowerCase() || "";

    return (
      type.includes("pdf") ||
      name.endsWith(".pdf")
    );
  };

  const isOfficeDocument = (document) => {
    const type = document?.type?.toLowerCase() || "";
    const name = document?.name?.toLowerCase() || "";

    return (
      type.includes("word") ||
      type.includes("excel") ||
      type.includes("powerpoint") ||
      type.includes("officedocument") ||
      /\.(doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp)$/i.test(name)
    );
  };

  const isImage = (document) => {
    const type = document?.type?.toLowerCase() || "";
    const name = document?.name?.toLowerCase() || "";

    return (
      type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)
    );
  };

  const getDocumentPreviewUrl = (document) => {
    if (!document?.url) return "";

    if (isPdf(document) || isOfficeDocument(document)) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(document.url)}`;
    }

    return document.url;
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =========================
          SIDEBAR
      ========================= */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =========================
          MAIN
      ========================= */}

      <main
        className={`min-h-screen ml-0 transition-all duration-300 ${
          sidebarOpen
            ? "lg:ml-[250px]"
            : "lg:ml-0"
        }`}
      >
        {/* =========================
            NAVBAR
        ========================= */}

        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <section className="p-6 lg:p-8">
          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Workspace
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Projects
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage all your projects from one place.
              </p>
            </div>

            <Link
              to="/admin/create-project"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Create Project
            </Link>
          </div>

          {/* =========================
              DEADLINE WARNING BANNER
          ========================= */}

          {deadlineWarnings.length > 0 && (
            <div className="mb-5 space-y-2">
              {deadlineWarnings.map((warning) => (
                <div
                  key={warning.projectId}
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
                >
                  <div className="mt-0.5 text-lg">⏰</div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-800">
                      Project deadline is approaching
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      "{warning.name}" is ending in {warning.timeText}. Due on {warning.dueDate}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================
              SEARCH
          ========================= */}

          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <input
              type="text"
              placeholder="Search project, status, technology or team member..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading projects...
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            /* =========================
               EMPTY STATE
            ========================= */

            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <div className="text-4xl">
                📁
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {search
                  ? "No matching projects"
                  : "No projects yet"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search."
                  : "Create your first project to get started."}
              </p>
            </div>
          ) : (
            /* =========================
               PROJECT LIST
            ========================= */

            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const isEditing =
                  editingId === project._id;

                const isExpanded =
                  expandedId === project._id;

                const projectDocuments =
                  getProjectDocuments(project);

                return (
                  <div
                    id={`project-${project._id}`}
                    key={project._id}
                    className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 ${
                      isExpanded || isEditing
                        ? "border-blue-200 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {/* =========================
                        PROJECT HEADER
                    ========================= */}

                    <div
                      onClick={() =>
                        !isEditing &&
                        toggleProject(project._id)
                      }
                      className={`flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 ${
                        isExpanded
                          ? "bg-slate-50/70"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
                          📁
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                              {project.name}
                            </h2>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Created{" "}
                            {project.createdAt
                              ? new Date(
                                  project.createdAt
                                ).toLocaleDateString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT SIDE */}

                      <div className="flex shrink-0 items-center gap-2">
                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            handleEdit(project);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Edit
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            handleDelete(
                              project._id
                            );
                          }}
                          disabled={
                            deleting === project._id
                          }
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {deleting === project._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                        {/* EXPAND */}

                        <div
                          className={`ml-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-transform duration-200 ${
                            isExpanded
                              ? "rotate-180"
                              : ""
                          }`}
                        >
                          ↓
                        </div>
                      </div>
                    </div>

                    {/* =========================
                        EXPANDED CONTENT
                    ========================= */}

                    {(isExpanded || isEditing) && (
                      <div className="border-t border-slate-100">
                        {/* =========================
                            EDIT MODE
                        ========================= */}

                        {isEditing ? (
                          <div className="p-6">
                            <div className="mb-6">
                              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                Editing Project
                              </p>

                              <h2 className="mt-1 text-xl font-bold text-slate-900">
                                Update project details
                              </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                              {/* NAME */}

                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Project Name
                                </label>

                                <input
                                  name="name"
                                  value={
                                    editForm.name
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* DESCRIPTION */}

                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Description
                                </label>

                                <textarea
                                  name="description"
                                  rows={4}
                                  value={
                                    editForm.description
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* STATUS */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Status
                                </label>

                                <select
                                  name="status"
                                  value={
                                    editForm.status
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                >
                                  <option value="Planning">
                                    Planning
                                  </option>

                                  <option value="In Progress">
                                    In Progress
                                  </option>

                                  <option value="Completed">
                                    Completed
                                  </option>

                                  <option value="On Hold">
                                    On Hold
                                  </option>
                                </select>
                              </div>

                              {/* TEAM SIZE */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Team Size
                                </label>

                                <input
                                  type="number"
                                  name="teamSize"
                                  min="1"
                                  value={
                                    editForm.teamSize
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* BUDGET */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Project Budget
                                </label>

                                <input
                                  type="number"
                                  name="budget"
                                  min="0"
                                  value={
                                    editForm.budget
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* TECHNOLOGIES */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Technologies
                                </label>

                                <input
                                  name="technologies"
                                  value={
                                    editForm.technologies
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="React, Node.js, MongoDB"
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* TEAM MEMBERS */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Team Members
                                </label>

                                <input
                                  name="teamMembers"
                                  value={
                                    editForm.teamMembers
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Vansh, Rahul, Aman"
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* START DATE */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Start Date
                                </label>

                                <input
                                  type="date"
                                  name="startDate"
                                  value={
                                    editForm.startDate
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* END DATE */}

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  End Date
                                </label>

                                <input
                                  type="date"
                                  name="endDate"
                                  value={
                                    editForm.endDate
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>

                              {/* =========================
                                  DOCUMENTS
                              ========================= */}

                              <div className="lg:col-span-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                  {/* DOCUMENT HEADER */}

                                  <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Project Documents
                                      </label>

                                      <p className="mt-1 text-xs text-slate-400">
                                        Manage documents attached to this project.
                                      </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                                      {
                                        editForm
                                          .documents
                                          ?.length || 0
                                      }{" "}
                                      {editForm.documents
                                        ?.length === 1
                                        ? "document"
                                        : "documents"}
                                    </span>
                                  </div>

                                  {/* EXISTING DOCUMENTS */}

                                  {editForm.documents
                                    ?.length > 0 ? (
                                    <div className="mb-5 space-y-2">
                                      {editForm.documents.map(
                                        (
                                          document,
                                          index
                                        ) => (
                                          <div
                                            key={
                                              document.publicId ||
                                              document._id ||
                                              index
                                            }
                                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                                          >
                                            <div className="flex min-w-0 items-center gap-3">
                                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-lg">
                                                📄
                                              </div>

                                              <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-700">
                                                  {document.name ||
                                                    "Untitled Document"}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                  {document.type ||
                                                    "Document"}
                                                </p>
                                              </div>
                                            </div>

                                            {/* ACTIONS */}

                                            <div className="flex shrink-0 items-center gap-2">
                                              {document.url && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();

                                                    handlePreviewDocument(
                                                      document
                                                    );
                                                  }}
                                                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                  View
                                                </button>
                                              )}

                                              <button
                                                type="button"
                                                disabled={
                                                  deletingDocument ===
                                                  document.publicId
                                                }
                                                onClick={(e) => {
                                                  e.stopPropagation();

                                                  handleDeleteDocument(
                                                    document
                                                  );
                                                }}
                                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                              >
                                                {deletingDocument ===
                                                document.publicId
                                                  ? "Deleting..."
                                                  : "Delete"}
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mb-5 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
                                      <div className="text-2xl">
                                        📄
                                      </div>

                                      <p className="mt-2 text-xs font-semibold text-slate-500">
                                        No documents attached
                                      </p>

                                      <p className="mt-1 text-[11px] text-slate-400">
                                        Upload a document below to attach it to this project.
                                      </p>
                                    </div>
                                  )}

                                  {/* UPLOAD */}

                                  <div className="rounded-lg border border-dashed border-blue-300 bg-white p-4">
                                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                                      Add New Document
                                    </label>

                                    <input
                                      type="file"
                                      onChange={
                                        handleFileChange
                                      }
                                      disabled={
                                        uploadingFile ||
                                        saving ===
                                          project._id
                                      }
                                      className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    {/* SELECTED FILE */}

                                    {selectedFile && (
                                      <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100">
                                            📎
                                          </div>

                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-slate-700">
                                              {
                                                selectedFile.name
                                              }
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                              {(
                                                selectedFile.size /
                                                1024 /
                                                1024
                                              ).toFixed(
                                                2
                                              )}{" "}
                                              MB
                                            </p>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={
                                            handleRemoveSelectedFile
                                          }
                                          disabled={
                                            uploadingFile
                                          }
                                          className="ml-3 rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}

                                    {/* UPLOAD STATUS */}

                                    {uploadingFile && (
                                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                                        <p className="text-xs font-semibold text-blue-600">
                                          Uploading document...
                                        </p>
                                      </div>
                                    )}

                                    <p className="mt-2 text-[10px] text-slate-400">
                                      Maximum file size: 10MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* EDIT BUTTONS */}

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                              <button
                                type="button"
                                onClick={
                                  handleCancelEdit
                                }
                                disabled={
                                  saving ===
                                  project._id
                                }
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSave(
                                    project._id
                                  )
                                }
                                disabled={
                                  saving ===
                                  project._id
                                }
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {saving === project._id
                                  ? uploadingFile
                                    ? "Uploading..."
                                    : "Saving..."
                                  : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* =========================
                             NORMAL EXPANDED VIEW
                          ========================= */

                          <div className="px-5 py-5">
                            {/* DESCRIPTION */}

                            <div className="mb-5">
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Description
                              </p>

                              <p className="text-sm leading-6 text-slate-600">
                                {project.description ||
                                  "No description available."}
                              </p>
                            </div>

                            {/* DETAILS */}

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 md:grid-cols-3 lg:grid-cols-5">
                              {/* TECHNOLOGIES */}

                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Technologies
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                  {project.technologies
                                    ?.length
                                    ? project.technologies.join(
                                        ", "
                                      )
                                    : "Not specified"}
                                </p>
                              </div>

                              {/* TEAM */}

                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Team
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                  {project.teamSize ||
                                    0}{" "}
                                  members
                                </p>
                              </div>

                              {/* BUDGET */}

                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Budget
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                  ₹
                                  {Number(
                                    project.budget ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              </div>

                              {/* START */}

                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Start
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                  {project.startDate
                                    ? new Date(
                                        project.startDate
                                      ).toLocaleDateString()
                                    : "Not set"}
                                </p>
                              </div>

                              {/* END */}

                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  End
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                  {project.endDate
                                    ? new Date(
                                        project.endDate
                                      ).toLocaleDateString()
                                    : "Not set"}
                                </p>
                              </div>
                            </div>

                            {/* TEAM MEMBERS */}

                            <div className="mt-5 border-t border-slate-100 pt-5">
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Team Members
                              </p>

                              {project.teamMembers
                                ?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {project.teamMembers.map(
                                    (
                                      member,
                                      index
                                    ) => (
                                      <span
                                        key={`${member}-${index}`}
                                        className="rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600"
                                      >
                                        {member}
                                      </span>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  No team members added.
                                </p>
                              )}
                            </div>

                            {/* DOCUMENTS */}

                            <div className="mt-5 border-t border-slate-100 pt-5">
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Documents (
                                  {
                                    projectDocuments.length
                                  }
                                  )
                                </p>
                              </div>

                              {projectDocuments.length >
                              0 ? (
                                <div className="space-y-2">
                                  {projectDocuments.map(
                                    (
                                      document,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          document.publicId ||
                                          document._id ||
                                          index
                                        }
                                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                                      >
                                        <div className="flex min-w-0 items-center gap-3">
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm">
                                            📄
                                          </div>

                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-700">
                                              {document.name ||
                                                "Untitled Document"}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-400">
                                              {document.type ||
                                                "Document"}
                                            </p>
                                          </div>
                                        </div>

                                        {/* VIEW */}

                                        {document.url && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();

                                              handlePreviewDocument(
                                                document
                                              );
                                            }}
                                            className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                          >
                                            View
                                          </button>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-lg bg-slate-50 px-4 py-3">
                                  <p className="text-xs text-slate-400">
                                    No documents attached to this project.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* COLLAPSE */}

                            <div className="mt-5 flex justify-center border-t border-slate-100 pt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(
                                    null
                                  )
                                }
                                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                ↑ Collapse Project
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ==================================================
          DOCUMENT PREVIEW MODAL
      ================================================== */}

      {previewDocument && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onClick={closePreview}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* =========================
                HEADER
            ========================= */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-800">
                  {previewDocument.name ||
                    "Document Preview"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {previewDocument.type ||
                    "Document"}
                </p>
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>

            {/* =========================
                DOCUMENT CONTENT
            ========================= */}

            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              {/* PDF */}

              {isPdf(previewDocument) || isOfficeDocument(previewDocument) ? (
                <iframe
                  src={getDocumentPreviewUrl(previewDocument)}
                  title={
                    previewDocument.name ||
                    "Document Preview"
                  }
                  className="h-full min-h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
                />
              ) : isImage(previewDocument) ? (
                /* IMAGE */

                <div className="flex min-h-full items-center justify-center">
                  <img
                    src={previewDocument.url}
                    alt={
                      previewDocument.name ||
                      "Document"
                    }
                    className="max-h-full max-w-full rounded-lg object-contain shadow"
                  />
                </div>
              ) : (
                /* UNSUPPORTED */

                <div className="flex min-h-full flex-col items-center justify-center px-5 text-center">
                  <div className="mb-4 text-5xl">
                    📄
                  </div>

                  <h3 className="text-lg font-semibold text-slate-700">
                    Preview not available
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    This file type cannot be previewed directly in the browser.
                  </p>

                  <a
                    href={previewDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Open Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProjects;