import { useEffect, useState } from "react";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Employees() {
  // ==================================================
  // SIDEBAR
  // ==================================================

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ==================================================
  // EMPLOYEES
  // ==================================================

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // TASK MODAL
  // ==================================================

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // ==================================================
  // FETCH EMPLOYEE TASKS
  // ==================================================

  const handleViewEmployeeTasks = async (employee) => {
    try {
      setSelectedEmployee(employee);
      setTasksLoading(true);

      const response = await api.get("/tasks");
      const allTasks = response.data?.tasks || [];

      // Filter tasks for this employee
      const filteredTasks = allTasks.filter(
        (task) =>
          (typeof task.assignedTo === "object" &&
            task.assignedTo?._id === employee._id) ||
          task.assignedTo === employee._id
      );

      setEmployeeTasks(filteredTasks);
    } catch (error) {
      console.error("Failed to fetch employee tasks:", error);
      alert("Failed to load employee tasks.");
    } finally {
      setTasksLoading(false);
    }
  };

  // ==================================================
  // CLOSE TASK MODAL
  // ==================================================

  const handleCloseTaskModal = () => {
    setSelectedEmployee(null);
    setEmployeeTasks([]);
  };

  // ==================================================
  // GET STATUS COLOR
  // ==================================================

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // ==================================================
  // UI
  // ==================================================

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // ==================================================
  // FETCH EMPLOYEES
  // ==================================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/employees");

      setEmployees(response.data?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoading(false);
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
    setForm({
      ...initialForm,
    });

    setShowForm(true);
  };

  // ==================================================
  // CANCEL
  // ==================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    setShowForm(false);

    setForm({
      ...initialForm,
    });
  };

  // ==================================================
  // CREATE EMPLOYEE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!form.name.trim()) {
      alert("Employee name is required.");
      return;
    }

    if (!form.email.trim()) {
      alert("Employee email is required.");
      return;
    }

    if (!form.password) {
      alert("Employee password is required.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);

      // ----------------------------------------------
      // CREATE EMPLOYEE
      // ----------------------------------------------

      const response = await api.post("/users/employees", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const newEmployee = response.data?.employee;

      if (newEmployee) {
        setEmployees((current) => [
          newEmployee,
          ...current,
        ]);
      } else {
        await fetchEmployees();
      }

      alert("Employee created successfully.");

      // ----------------------------------------------
      // RESET
      // ----------------------------------------------

      setForm({
        ...initialForm,
      });

      setShowForm(false);
    } catch (error) {
      console.error("Create employee error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to create employee."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    const name =
      employee.name?.toLowerCase() || "";

    const email =
      employee.email?.toLowerCase() || "";

    return (
      name.includes(searchText) ||
      email.includes(searchText)
    );
  });

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
                Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Employees
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage employee accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Create Employee
            </button>

          </div>

          {/* ==================================================
              STATISTIC
          ================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "..." : employees.length}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Accounts
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "..." : employees.length}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Role
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                Employee
              </p>

            </div>

          </div>

          {/* ==================================================
              CREATE EMPLOYEE FORM
          ================================================== */}

          {showForm && (
            <div className="mb-6 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  New Employee
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Create employee account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The employee will use these credentials to log in.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6"
              >

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                  {/* NAME */}

                  <div>

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Employee Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter employee name"
                      autoComplete="name"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="employee@example.com"
                      autoComplete="email"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  {/* PASSWORD */}

                  <div className="lg:col-span-2">

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Temporary Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      minLength={6}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Give this password to the employee securely.
                    </p>

                  </div>

                </div>

                {/* BUTTONS */}

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
                      ? "Creating..."
                      : "Create Employee"}
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
              placeholder="Search employee by name or email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

          </div>

          {/* ==================================================
              EMPLOYEE LIST
          ================================================== */}

          {loading ? (

            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading employees...
              </p>

            </div>

          ) : filteredEmployees.length === 0 ? (

            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">

              <div className="text-4xl">
                👥
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {search
                  ? "No employees found"
                  : "No employees yet"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search."
                  : "Create your first employee account."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Create Employee
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* TABLE HEADER */}

              <div className="hidden grid-cols-5 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">

                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Created</div>
                <div>Actions</div>

              </div>

              {/* EMPLOYEES */}

              <div className="divide-y divide-slate-100">

                {filteredEmployees.map((employee) => (

                  <div
                    key={employee._id}
                    className="grid grid-cols-1 gap-3 px-6 py-5 transition hover:bg-slate-50 md:grid-cols-5 md:items-center"
                  >

                    {/* NAME */}

                    <div>

                      <p className="text-sm font-semibold text-slate-900">
                        {employee.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400 md:hidden">
                        Employee
                      </p>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <p className="break-all text-sm text-slate-600">
                        {employee.email}
                      </p>

                    </div>

                    {/* ROLE */}

                    <div>

                      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {employee.role}
                      </span>

                    </div>

                    {/* CREATED */}

                    <div>

                      <p className="text-sm text-slate-500">
                        {employee.createdAt
                          ? new Date(
                              employee.createdAt
                            ).toLocaleDateString()
                          : "Recently"}
                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div>

                      <button
                        onClick={() => handleViewEmployeeTasks(employee)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        View Tasks
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </section>

      </main>

      {/* ==================================================
          TASK MODAL
      ================================================== */}

      {selectedEmployee && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseTaskModal}
        >
          <div 
            className="flex w-full max-w-xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header - Enhanced */}
            <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {selectedEmployee.name}
                  </h2>
                  <p className="mt-1 text-xs text-blue-100">
                    {selectedEmployee.email}
                  </p>
                  <div className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                    📋 {employeeTasks.length} {employeeTasks.length === 1 ? "Task" : "Tasks"}
                  </div>
                </div>
                <button
                  onClick={handleCloseTaskModal}
                  className="mt-1 rounded-lg bg-white/20 p-1.5 text-xl font-bold text-white transition hover:bg-white/30"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {tasksLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
                  <p className="mt-3 text-xs text-slate-500">Loading tasks...</p>
                </div>
              ) : employeeTasks.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                  <div className="text-3xl">📭</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">
                    No tasks assigned yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    This employee currently has no active tasks.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeTasks.map((task) => {
                    const completionPercentage =
                      task.status === "Completed"
                        ? 100
                        : task.status === "In Progress"
                        ? 50
                        : 0;

                    const statusIcon =
                      task.status === "Completed"
                        ? "✅"
                        : task.status === "In Progress"
                        ? "⚡"
                        : "⏳";

                    const priorityColor =
                      task.priority === "High"
                        ? "text-red-600"
                        : task.priority === "Medium"
                        ? "text-amber-600"
                        : "text-green-600";

                    return (
                      <div
                        key={task._id}
                        className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <span className="text-lg shrink-0">{statusIcon}</span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`w-fit rounded-full border px-2 py-1 text-[10px] font-bold whitespace-nowrap shrink-0 ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status || "Pending"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 rounded-full bg-slate-100 p-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold mb-0.5">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-slate-900">{completionPercentage}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                task.status === "Completed"
                                  ? "w-full bg-emerald-500"
                                  : task.status === "In Progress"
                                  ? "w-1/2 bg-blue-500"
                                  : "w-0 bg-orange-500"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Task Details Grid */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          
                          {/* Priority */}
                          <div className="rounded-md bg-slate-50 p-2">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                              Priority
                            </p>
                            <p className={`mt-0.5 text-xs font-bold ${priorityColor}`}>
                              {task.priority || "Medium"}
                            </p>
                          </div>

                          {/* Project */}
                          <div className="rounded-md bg-slate-50 p-2">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                              Project
                            </p>
                            <p className="mt-0.5 truncate text-xs font-semibold text-slate-900">
                              {typeof task.project === "object"
                                ? task.project?.name
                                : "Project"}
                            </p>
                          </div>

                          {/* Due Date */}
                          <div className="rounded-md bg-slate-50 p-2">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                              Due
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-900">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString("en-IN")
                                : "—"}
                            </p>
                          </div>

                          {/* Created Date */}
                          <div className="rounded-md bg-slate-50 p-2">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                              Created
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-900">
                              {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString("en-IN")
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-3">
              <button
                onClick={handleCloseTaskModal}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;