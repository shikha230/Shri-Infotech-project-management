
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function AdminTasks() {
  // ==================================================
  // SIDEBAR
  // ==================================================

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ==================================================
  // DATA
  // ==================================================

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  // ==================================================
  // UI STATES
  // ==================================================

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // ==================================================
  // FORM
  // ==================================================

  const initialForm = {
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  };

  const [form, setForm] = useState(initialForm);

  // ==================================================
  // FETCH DATA
  // ==================================================

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchEmployees();
  }, []);

  // ==================================================
  // FETCH TASKS
  // ==================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tasks");

      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH PROJECTS
  // ==================================================

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);

      const response = await api.get("/projects");

      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  // ==================================================
  // FETCH EMPLOYEES
  // ==================================================

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);

      const response = await api.get("/users/employees");

      setEmployees(response.data?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==================================================
  // OPEN CREATE FORM
  // ==================================================

  const handleCreate = () => {
    setEditingId(null);

    setForm({
      ...initialForm,
    });

    setShowForm(true);
  };

  // ==================================================
  // OPEN EDIT FORM
  // ==================================================

  const handleEdit = (task) => {
    setEditingId(task._id);

    setForm({
      title: task.title || "",

      description: task.description || "",

      project:
        typeof task.project === "object"
          ? task.project?._id || ""
          : task.project || "",

      assignedTo:
        typeof task.assignedTo === "object"
          ? task.assignedTo?._id || ""
          : task.assignedTo || "",

      priority: task.priority || "Medium",

      status: task.status || "Pending",

      dueDate: task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // CLOSE FORM
  // ==================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);

    setForm({
      ...initialForm,
    });
  };

  // ==================================================
  // SAVE TASK
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!form.title.trim()) {
      alert("Task title is required.");
      return;
    }

    if (!form.project) {
      alert("Please select a project.");
      return;
    }

    if (!form.assignedTo) {
      alert("Please select an employee.");
      return;
    }

    try {
      setSaving(true);

      const taskData = {
        title: form.title.trim(),

        description: form.description.trim(),

        project: form.project,

        assignedTo: form.assignedTo,

        priority: form.priority,

        status: form.status,

        dueDate: form.dueDate || null,
      };

      // ----------------------------------------------
      // CREATE
      // ----------------------------------------------

      if (!editingId) {
        const response = await api.post(
          "/tasks",
          taskData
        );

        const newTask = response.data?.task;

        if (newTask) {
          setTasks((current) => [
            newTask,
            ...current,
          ]);
        }

        alert("Task created successfully.");
      }

      // ----------------------------------------------
      // UPDATE
      // ----------------------------------------------

      else {
        const response = await api.put(
          `/tasks/${editingId}`,
          taskData
        );

        const updatedTask =
          response.data?.task;

        if (updatedTask) {
          setTasks((current) =>
            current.map((task) =>
              task._id === editingId
                ? updatedTask
                : task
            )
          );
        }

        alert("Task updated successfully.");
      }

      // ----------------------------------------------
      // RESET
      // ----------------------------------------------

      setShowForm(false);
      setEditingId(null);

      setForm({
        ...initialForm,
      });
    } catch (error) {
      console.error("Save task error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // DELETE TASK
  // ==================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);

      await api.delete(`/tasks/${id}`);

      setTasks((current) =>
        current.filter(
          (task) => task._id !== id
        )
      );

      if (editingId === id) {
        handleCancel();
      }

      alert("Task deleted successfully.");
    } catch (error) {
      console.error("Delete task error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete task."
      );
    } finally {
      setDeleting(null);
    }
  };

  // ==================================================
  // STATUS CLASS
  // ==================================================

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  // ==================================================
  // PRIORITY CLASS
  // ==================================================

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (priority === "Medium") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  // ==================================================
  // GET PROJECT NAME
  // ==================================================

  const getProjectName = (project) => {
    if (!project) {
      return "Unknown project";
    }

    if (typeof project === "object") {
      return project.name || "Unknown project";
    }

    const foundProject = projects.find(
      (item) => item._id === project
    );

    return foundProject?.name || "Unknown project";
  };

  // ==================================================
  // GET EMPLOYEE NAME
  // ==================================================

  const getEmployeeName = (employee) => {
    if (!employee) {
      return "Unknown employee";
    }

    if (typeof employee === "object") {
      return (
        employee.name ||
        employee.email ||
        "Unknown employee"
      );
    }

    const foundEmployee = employees.find(
      (item) => item._id === employee
    );

    return (
      foundEmployee?.name ||
      foundEmployee?.email ||
      "Unknown employee"
    );
  };

  // ==================================================
  // DEADLINE
  // ==================================================

  const isOverdue = (task) => {
    if (
      !task?.dueDate ||
      task.status === "Completed"
    ) {
      return false;
    }

    return (
      new Date(task.dueDate).getTime() <
      Date.now()
    );
  };

  // ==================================================
  // FILTER TASKS
  // ==================================================

  const filteredTasks = tasks.filter((task) => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      return true;
    }

    const title =
      task.title?.toLowerCase() || "";

    const description =
      task.description?.toLowerCase() || "";

    const priority =
      task.priority?.toLowerCase() || "";

    const status =
      task.status?.toLowerCase() || "";

    const projectName =
      getProjectName(task.project)
        .toLowerCase();

    const employeeName =
      getEmployeeName(task.assignedTo)
        .toLowerCase();

    return (
      title.includes(searchText) ||
      description.includes(searchText) ||
      priority.includes(searchText) ||
      status.includes(searchText) ||
      projectName.includes(searchText) ||
      employeeName.includes(searchText)
    );
  });

  // ==================================================
  // STATISTICS
  // ==================================================

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ==================================================
          MAIN
      ================================================== */}

      <main
        className={`min-h-screen ml-0 transition-all duration-300 ${
          sidebarOpen
            ? "lg:ml-[250px]"
            : "lg:ml-0"
        }`}
      >

        {/* ==================================================
            NAVBAR
        ================================================== */}

        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <section className="p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Workspace
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Tasks
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage tasks assigned to your employees.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Create Task
            </button>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Tasks
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "..." : totalTasks}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {loading ? "..." : pendingTasks}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                In Progress
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {loading ? "..." : inProgressTasks}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "..." : completedTasks}
              </p>
            </div>

          </div>

          {/* ==================================================
              CREATE / EDIT FORM
          ================================================== */}

          {showForm && (
            <div className="mb-6 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {editingId
                    ? "Edit Task"
                    : "New Task"}
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {editingId
                    ? "Update task details"
                    : "Create a new task"}
                </h2>

              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6"
              >

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                  {/* TASK TITLE */}

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Task Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter task title"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the task..."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  {/* PROJECT */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Project
                    </label>

                    <select
                      name="project"
                      value={form.project}
                      onChange={handleChange}
                      disabled={projectsLoading}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {projectsLoading
                          ? "Loading projects..."
                          : "Select project"}
                      </option>

                      {projects.map((project) => (
                        <option
                          key={project._id}
                          value={project._id}
                        >
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* EMPLOYEE */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Assign Employee
                    </label>

                    <select
                      name="assignedTo"
                      value={form.assignedTo}
                      onChange={handleChange}
                      disabled={employeesLoading}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {employeesLoading
                          ? "Loading employees..."
                          : "Select employee"}
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.name}{" "}
                          {employee.email
                            ? `(${employee.email})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PRIORITY */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>
                    </select>
                  </div>

                  {/* STATUS */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>
                    </select>
                  </div>

                  {/* DUE DATE */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </label>

                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                </div>

                {/* FORM BUTTONS */}

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? editingId
                        ? "Saving..."
                        : "Creating..."
                      : editingId
                      ? "Save Changes"
                      : "Create Task"}
                  </button>

                </div>

              </form>
            </div>
          )}

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

            <input
              type="text"
              placeholder="Search task, project, employee, priority or status..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

          </div>

          {/* ==================================================
              TASK LIST
          ================================================== */}

          {loading ? (

            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading tasks...
              </p>

            </div>

          ) : filteredTasks.length === 0 ? (

            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">

              <div className="text-4xl">
                ✓
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {search
                  ? "No matching tasks"
                  : "No tasks yet"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search."
                  : "Create your first task to assign work to an employee."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Create Task
                </button>
              )}

            </div>

          ) : (

            <div className="space-y-3">

              {filteredTasks.map((task) => {

                const overdue =
                  isOverdue(task);

                return (
                  <div
                    key={task._id}
                    className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                      overdue
                        ? "border-red-200"
                        : "border-slate-200"
                    }`}
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-base font-bold text-slate-900">
                            {task.title}
                          </h2>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority} Priority
                          </span>

                        </div>

                        {task.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {task.description}
                          </p>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(task)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              task._id
                            )
                          }
                          disabled={
                            deleting ===
                            task._id
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleting ===
                          task._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">

                      {/* PROJECT */}

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Project
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {getProjectName(
                            task.project
                          )}
                        </p>

                      </div>

                      {/* EMPLOYEE */}

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Assigned To
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {getEmployeeName(
                            task.assignedTo
                          )}
                        </p>

                      </div>

                      {/* DUE DATE */}

                      <div
                        className={`rounded-lg p-3 ${
                          overdue
                            ? "bg-red-50"
                            : "bg-slate-50"
                        }`}
                      >

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Due Date
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold ${
                            overdue
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {task.dueDate
                            ? new Date(
                                task.dueDate
                              ).toLocaleDateString()
                            : "Not set"}

                          {overdue &&
                            " • Overdue"}
                        </p>

                      </div>

                      {/* CREATED */}

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Created
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {task.createdAt
                            ? new Date(
                                task.createdAt
                              ).toLocaleDateString()
                            : "Recently"}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default AdminTasks;

