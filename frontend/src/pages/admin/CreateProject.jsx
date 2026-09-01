import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

function CreateProject() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ========================================
  // FORM DATA
  // ========================================
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    technologies: "",
    budget: "",
    startDate: "",
    endDate: "",
    teamMembers: [],
  });

  // ========================================
  // STATES
  // ========================================
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // FETCH EMPLOYEES
  // ========================================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError("");

        const response = await api.get("/users/employees");

        console.log("Users API response:", response.data);

        const users = response.data?.employees || [];
        const userList = Array.isArray(users) ? users : [];

        setEmployees(userList);
      } catch (err) {
        console.error("Fetch employees error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load employees."
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // ========================================
  // HANDLE NORMAL INPUTS
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // HANDLE EMPLOYEE CHECKBOX
  // ========================================
  const handleEmployeeToggle = (employeeId) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.teamMembers.includes(employeeId);

      if (alreadySelected) {
        return {
          ...previous,
          teamMembers: previous.teamMembers.filter(
            (id) => id !== employeeId
          ),
        };
      }

      return {
        ...previous,
        teamMembers: [
          ...previous.teamMembers,
          employeeId,
        ],
      };
    });
  };

  // ========================================
  // HANDLE DOCUMENT SELECTION
  // ========================================
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

    // Allow selecting the same file again
    e.target.value = "";
  };

  // ========================================
  // REMOVE DOCUMENT
  // ========================================
  const removeDocument = (indexToRemove) => {
    setDocuments((previousFiles) =>
      previousFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  // ========================================
  // SELECTED EMPLOYEE OBJECTS
  // ========================================
  const selectedEmployees = employees.filter(
    (employee) =>
      formData.teamMembers.includes(employee._id)
  );

  // ========================================
  // SUBMIT PROJECT
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ========================================
    // VALIDATION
    // ========================================
    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Project description is required.");
      return;
    }

    if (formData.startDate && formData.endDate) {
      if (
        new Date(formData.endDate) <
        new Date(formData.startDate)
      ) {
        setError(
          "End date cannot be before start date."
        );
        return;
      }
    }

    try {
      setLoading(true);

      // ========================================
      // TECHNOLOGIES
      // ========================================
      const technologies = formData.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // ========================================
      // UPLOAD DOCUMENTS
      // ========================================
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

      // ========================================
      // CREATE PROJECT
      // ========================================
      const projectData = {
        name: formData.name.trim(),

        description: formData.description.trim(),

        status: formData.status,

        technologies,

        teamSize: formData.teamMembers.length,

        teamMembers: formData.teamMembers,

        budget: Number(formData.budget) || 0,

        startDate:
          formData.startDate || undefined,

        endDate:
          formData.endDate || undefined,

        documents: uploadedDocuments,
      };

      console.log(
        "Creating project:",
        projectData
      );

      await api.post(
        "/projects",
        projectData
      );

      // ========================================
      // SUCCESS
      // ========================================
      navigate("/admin/projects");
    } catch (err) {
      console.error(
        "Create project error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* ========================================
          PAGE HEADER
      ======================================== */}
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

      {/* ========================================
          FORM
      ======================================== */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">

          {/* ======================================
              LEFT COLUMN
          ======================================= */}
          <div className="col-span-12 space-y-6 lg:col-span-8">

            {/* ====================================
                PROJECT DETAILS
            ===================================== */}
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

                {/* PROJECT NAME */}
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

                {/* DESCRIPTION */}
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

                {/* TECHNOLOGIES */}
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

            {/* ====================================
                TIMELINE
            ===================================== */}
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

                {/* START DATE */}
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

                {/* END DATE */}
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

            {/* ====================================
                DOCUMENTS
            ===================================== */}
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

                {/* UPLOAD BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
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

                {/* HIDDEN FILE INPUT */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleDocumentChange}
                  className="hidden"
                />

                {/* SELECTED FILES */}
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

                      {documents.map(
                        (file, index) => (
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
                        )
                      )}

                    </div>
                  </div>
                )}

              </div>
            </section>

          </div>

          {/* ======================================
              RIGHT COLUMN
          ======================================= */}
          <div className="col-span-12 space-y-6 lg:col-span-4">

            {/* ====================================
                PROJECT SETTINGS
            ===================================== */}
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

                {/* STATUS */}
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

                {/* TEAM SIZE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team size
                  </label>

                  <input
                    type="number"
                    value={formData.teamMembers.length}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                  />
                </div>

                {/* BUDGET */}
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

                {/* =================================
                    TEAM MEMBERS
                ================================== */}
                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team Members
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                    {/* LOADING */}
                    {loadingEmployees ? (
                      <p className="py-3 text-center text-xs text-slate-400">
                        Loading employees...
                      </p>
                    ) : employees.length === 0 ? (
                      <p className="py-3 text-center text-xs text-slate-400">
                        No employees available.
                      </p>
                    ) : (
                      <div className="space-y-2">

                        {employees.map(
                          (employee) => {

                            const selected =
                              formData.teamMembers.includes(
                                employee._id
                              );

                            return (
                              <label
                                key={employee._id}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                                  selected
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                              >

                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() =>
                                    handleEmployeeToggle(
                                      employee._id
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div className="min-w-0">

                                  <p className="text-sm font-semibold text-slate-700">
                                    {employee.name ||
                                      "Unnamed employee"}
                                  </p>

                                  <p className="truncate text-xs text-slate-400">
                                    {employee.email ||
                                      "No email"}
                                  </p>

                                </div>

                              </label>
                            );
                          }
                        )}

                      </div>
                    )}

                    <p className="mt-3 text-[10px] text-slate-400">
                      Select the employees assigned to this project.
                    </p>

                  </div>
                </div>

              </div>
            </section>

            {/* ====================================
                PREVIEW
            ===================================== */}
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

                {/* STATUS + TEAM */}
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
                        {formData.teamMembers.length}{" "}
                        {formData.teamMembers.length === 1
                          ? "member"
                          : "members"}
                      </p>
                    </div>

                  </div>

                  {/* SELECTED TEAM MEMBERS */}
                  {selectedEmployees.length > 0 && (
                    <div className="mt-5">

                      <p className="mb-2 text-xs text-slate-500">
                        Team members
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {selectedEmployees.map(
                          (employee) => (
                            <span
                              key={employee._id}
                              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200"
                            >
                              {employee.name}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* TECHNOLOGIES */}
                  {formData.technologies && (
                    <div className="mt-5">

                      <p className="mb-2 text-xs text-slate-500">
                        Technologies
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {formData.technologies
                          .split(",")
                          .map(
                            (technology, index) => {
                              const tech =
                                technology.trim();

                              if (!tech) {
                                return null;
                              }

                              return (
                                <span
                                  key={index}
                                  className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-200"
                                >
                                  {tech}
                                </span>
                              );
                            }
                          )}

                      </div>

                    </div>
                  )}

                  {/* DOCUMENTS */}
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

                  {/* BUDGET */}
                  {formData.budget && (
                    <div className="mt-5 border-t border-white/10 pt-5">

                      <p className="text-xs text-slate-500">
                        Budget
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        ₹
                        {Number(
                          formData.budget
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>
                  )}

                </div>

              </div>
            </section>

          </div>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ========================================
            BOTTOM ACTIONS
        ======================================== */}
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

