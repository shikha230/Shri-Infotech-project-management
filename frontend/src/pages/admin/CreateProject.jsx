import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

function CreateProject() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    technologies: "",
    teamSize: 0,
    teamMembers: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // Handle normal inputs
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Handle document selection
  // =========================
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files || []);

    setError("");

    if (files.length === 0) {
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const invalidFile = files.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      setError(
        `"${invalidFile.name}" is larger than 10 MB. Please choose a smaller file.`
      );

      e.target.value = "";
      return;
    }

    setDocuments((previousFiles) => [
      ...previousFiles,
      ...files,
    ]);

    // Allows selecting the same file again later
    e.target.value = "";
  };

  // =========================
  // Remove document
  // =========================
  const removeDocument = (indexToRemove) => {
    setDocuments((previousFiles) =>
      previousFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  // =========================
  // Submit project
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Project description is required.");
      return;
    }

    try {
      setLoading(true);

      // Technologies
      const technologies = formData.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // Team members
      const teamMembers = formData.teamMembers
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean);

      const uploadedDocuments = await Promise.all(
        documents.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);

          const response = await api.post(
            "/upload",
            uploadData
          );

          return response.data.file;
        })
      );

      // =========================
      // Send request
      // =========================
      await api.post(
        "/projects",
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
          technologies,
          teamSize: teamMembers.length,
          teamMembers,
          budget: Number(formData.budget) || 0,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          documents: uploadedDocuments,
        }
      );

      // Success
      navigate("/admin/projects");

    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Calculate team members
  // =========================
  const teamMemberList = formData.teamMembers
    .split(",")
    .map((member) => member.trim())
    .filter(Boolean);

  return (
    <AdminLayout>
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Projects</span>

          <span>/</span>

          <span className="text-slate-600">
            New Project
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create a new project
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add project details, configure your project,
          and upload related documents.
        </p>
      </div>

      {/* =========================
          FORM
      ========================== */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">

          {/* =====================================================
              MAIN COLUMN
          ====================================================== */}
          <div className="col-span-12 space-y-6 lg:col-span-8">

            {/* =========================
                PROJECT DETAILS
            ========================== */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-7 py-5">
                <h2 className="font-semibold text-slate-900">
                  Project details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Basic information about your project.
                </p>
              </div>

              <div className="space-y-6 p-7">

                {/* Project Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Marketing Website"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </label>

                  <textarea
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What is this project about?"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Technologies
                  </label>

                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Separate technologies with commas.
                  </p>
                </div>

              </div>
            </section>

            {/* =========================
                TIMELINE
            ========================== */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-7 py-5">
                <h2 className="font-semibold text-slate-900">
                  Timeline
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Set the expected project duration.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-2">

                {/* Start Date */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

              </div>
            </section>

            {/* =========================
                DOCUMENTS
            ========================== */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-7 py-5">
                <h2 className="font-semibold text-slate-900">
                  Project documents
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Upload documents related to this project.
                </p>
              </div>

              <div className="p-7">

                {/* Upload box */}
                {/* Compact Upload Box */}
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="group w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
>
  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg transition group-hover:bg-blue-100">
    📄
  </div>

  <h3 className="mt-2 text-sm font-semibold text-slate-800">
    Upload documents
  </h3>

  <p className="mt-1 text-xs text-slate-400">
    Click to choose one or more files
  </p>

  <p className="mt-1 text-[11px] text-slate-400">
    Maximum 10 MB per file
  </p>
</button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleDocumentChange}
                  className="hidden"
                />

                {/* Selected files */}
                {documents.length > 0 && (
                  <div className="mt-6">

                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Selected documents
                      </p>

                      <p className="text-xs text-slate-400">
                        {documents.length}{" "}
                        {documents.length === 1
                          ? "file"
                          : "files"}
                      </p>
                    </div>

                    <div className="space-y-2">

                      {documents.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                              📄
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {file.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {(
                                  file.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeDocument(index)
                            }
                            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                    </div>
                  </div>
                )}

              </div>
            </section>

          </div>

          {/* =====================================================
              RIGHT COLUMN
          ====================================================== */}
          <div className="col-span-12 space-y-6 lg:col-span-4">

            {/* =========================
                PROJECT SETTINGS
            ========================== */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Project settings
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Configure your project.
                </p>
              </div>

              <div className="space-y-5 p-6">

                {/* Status */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                {/* Team Size */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team size
                  </label>

                  <input
                    type="number"
                    value={teamMemberList.length}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project Budget
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="budget"
                      min="0"
                      placeholder="e.g. 50000"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team members
                  </label>

                  <input
                    type="text"
                    name="teamMembers"
                    value={formData.teamMembers}
                    onChange={handleChange}
                    placeholder="Vansh, Rahul, Aman"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Enter names separated by commas.
                  </p>
                </div>

              </div>
            </section>

            {/* =========================
                PREVIEW
            ========================== */}
            <section className="overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg">

              <div className="p-6">

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Preview
                </p>

                <h3 className="mt-4 text-xl font-bold">
                  {formData.name ||
                    "Untitled project"}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                  {formData.description ||
                    "Your project description will appear here."}
                </p>

                {/* Status + Team */}
                <div className="mt-6 border-t border-white/10 pt-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs text-slate-500">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formData.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Team
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {teamMemberList.length}{" "}
                        {teamMemberList.length === 1
                          ? "member"
                          : "members"}
                      </p>
                    </div>

                  </div>

                  {/* Team Members */}
                  {teamMemberList.length > 0 && (
                    <div className="mt-5">

                      <p className="mb-2 text-xs text-slate-500">
                        Team members
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {teamMemberList.map(
                          (member, index) => (
                            <span
                              key={index}
                              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200"
                            >
                              {member}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* Documents preview */}
                  {documents.length > 0 && (
                    <div className="mt-5 border-t border-white/10 pt-5">

                      <p className="text-xs text-slate-500">
                        Documents
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        📄 {documents.length}{" "}
                        {documents.length === 1
                          ? "document"
                          : "documents"}
                      </p>

                    </div>
                  )}

                </div>

              </div>

            </section>

          </div>
        </div>

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================
            BOTTOM ACTIONS
        ========================== */}
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/projects")
            }
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create project"}
          </button>

        </div>
      </form>
    </AdminLayout>
  );
}

export default CreateProject;