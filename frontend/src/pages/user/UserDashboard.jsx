import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

function UserDashboard({ initialView = "dashboard" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const viewFromPath = location.pathname.includes("/user/projects")
    ? "projects"
    : location.pathname.includes("/user/tasks")
      ? "tasks"
      : "dashboard";

  const activeView = initialView || viewFromPath;

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/projects/my");
        setProjects(response.data.projects || []);
      } catch (err) {
        console.error("Get my projects error:", err);
        setError(
          err.response?.data?.message || "Unable to load your projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setTasksLoading(true);
        setTasksError("");

        const response = await api.get("/tasks/my");
        setTasks(response.data.tasks || []);
      } catch (err) {
        console.error("Get my tasks error:", err);
        setTasksError(
          err.response?.data?.message || "Unable to load your tasks."
        );
      } finally {
        setTasksLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  const handleUpdateTaskStatus = async (taskId, nextStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/toggle`, { status: nextStatus });
      const updatedTask = response.data.task;

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === updatedTask._id
            ? { ...task, status: updatedTask.status }
            : task
        )
      );
    } catch (error) {
      console.error("Update task status error:", error);
      alert(error.response?.data?.message || "Unable to update task status.");
    }
  };

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "Completed").length,
    [tasks]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status !== "Completed").length,
    [tasks]
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "On Hold":
        return "bg-amber-100 text-amber-700";
      case "Planning":
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getProjectStatusBadge = (status) => {
    const normalized = status || "Planning";

    if (normalized === "Completed") {
      return { label: "Completed", className: "bg-emerald-100 text-emerald-700" };
    }

    if (normalized === "In Progress") {
      return { label: "In Progress", className: "bg-blue-100 text-blue-700" };
    }

    return { label: "Pending", className: "bg-amber-100 text-amber-700" };
  };

  const visibleProjects = activeView === "projects" ? projects : projects.slice(0, 3);
  const visibleTasks = activeView === "tasks" ? tasks : tasks.slice(0, 4);

  const navItems = [
    { label: "Dashboard", to: "/user", icon: "▣" },
    { label: "My Projects", to: "/user/projects", icon: "▤" },
    { label: "My Tasks", to: "/user/tasks", icon: "✓" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderDashboard = () => (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tasks" value={tasksLoading ? "—" : tasks.length} accent="blue" />
        <StatCard label="Pending" value={tasksLoading ? "—" : pendingTasks} accent="amber" />
        <StatCard label="Completed" value={tasksLoading ? "—" : completedTasks} accent="green" />
        <StatCard label="Projects" value={loading ? "—" : projects.length} accent="indigo" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="My Tasks"
            subtitle="Recent work assigned to you"
            actionLabel="View all tasks"
            onAction={() => navigate("/user/tasks")}
          />

          {tasksError && <Alert message={tasksError} />}

          {tasksLoading ? (
            <Loader label="Loading your tasks..." />
          ) : visibleTasks.length === 0 ? (
            <EmptyState icon="✅" title="No tasks assigned" text="Your admin-assigned tasks will show up here." />
          ) : (
            <div className="mt-5 space-y-3">
              {visibleTasks.map((task) => (
                <div
                  key={task._id}
                  className={`rounded-2xl border p-4 transition ${task.status === "Completed" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50/80"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div>
                        <h3 className={`font-semibold ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <select
                      value={task.status || "Pending"}
                      onChange={(event) => handleUpdateTaskStatus(task._id, event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-400"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {task.project && <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{task.project.name}</span>}
                    {task.project?.status && (
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${getProjectStatusBadge(task.project.status).className}`}>
                        Project: {getProjectStatusBadge(task.project.status).label}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="rounded-md bg-slate-100 px-2 py-1">
                        Due {new Date(task.dueDate).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="My Projects"
            subtitle="Active workspaces"
            actionLabel="Open all"
            onAction={() => navigate("/user/projects")}
          />

          {error && <Alert message={error} />}

          {loading ? (
            <Loader label="Loading your projects..." />
          ) : visibleProjects.length === 0 ? (
            <EmptyState icon="📁" title="No projects assigned" text="Your assigned projects will appear here." />
          ) : (
            <div className="mt-5 space-y-4">
              {visibleProjects.map((project) => (
                <div key={project._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-800">{project.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{project.description}</p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{project.teamSize || 0} members</span>
                    <span>{project.documents?.length || 0} docs</span>
                  </div>

                  <button
                    onClick={() => navigate(`/user/projects/${project._id}`)}
                    className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );

  const renderProjects = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader title="My Projects" subtitle="All project workstreams assigned to you" />

      {error && <Alert message={error} />}

      {loading ? (
        <Loader label="Loading your projects..." />
      ) : projects.length === 0 ? (
        <EmptyState icon="📁" title="No projects assigned" text="You do not have any active project assignments yet." />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{project.description}</p>
              </div>

              <div className="space-y-4 p-5">
                {project.technologies?.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((technology, index) => (
                        <span key={index} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Team</p>
                    <p className="mt-1 font-semibold text-slate-700">{project.teamSize || 0} members</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Docs</p>
                    <p className="mt-1 font-semibold text-slate-700">{project.documents?.length || 0}</p>
                  </div>
                </div>

                {(project.startDate || project.endDate) && (
                  <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Timeline</p>
                    <p className="mt-1">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : "Not set"}
                      {" → "}
                      {project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN") : "Not set"}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/user/projects/${project._id}`)}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderTasks = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader title="My Tasks" subtitle="Complete and track the work assigned to you" />

      {tasksError && <Alert message={tasksError} />}

      {tasksLoading ? (
        <Loader label="Loading your tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState icon="✅" title="No tasks assigned" text="No tasks have been assigned to you yet." />
      ) : (
        <div className="mt-6 space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`rounded-2xl border p-5 transition ${task.status === "Completed" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50"}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className={`text-base font-semibold ${task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {task.title}
                    </h3>
                    {task.description && <p className="mt-1 text-sm text-slate-500">{task.description}</p>}
                    {task.project && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{task.project.name}</span>
                        {task.project.status && (
                          <span className={`rounded-full px-2.5 py-1 font-semibold ${getProjectStatusBadge(task.project.status).className}`}>
                            Project: {getProjectStatusBadge(task.project.status).label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <select
                    value={task.status || "Pending"}
                    onChange={(event) => handleUpdateTaskStatus(task._id, event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-400"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {task.dueDate && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Due {new Date(task.dueDate).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderContent = () => {
    if (activeView === "projects") return renderProjects();
    if (activeView === "tasks") return renderTasks();
    return renderDashboard();
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "border-[#FF5A3C] bg-white/[0.04] text-white"
        : "border-transparent text-[#8FA6C2] hover:border-[#3A5578] hover:bg-white/[0.03] hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap');

        .ph-mono {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
        }

        .ph-sans {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-[#0B1524] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Faint grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,180,214,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,180,214,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex h-[72px] shrink-0 items-center border-b border-[#1c2b3d] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#3A5578] text-sm font-semibold text-[#FF5A3C] ph-mono">
              P
            </div>

            <div>
              <h1 className="ph-sans text-base font-bold text-white">
                Shri-Infotech
              </h1>

              <p className="ph-mono text-[10px] uppercase tracking-[0.2em] text-[#5B7DA6]">
                Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="ph-sans relative z-10 flex-1 px-4 py-7 overflow-y-auto">

          {/* Workspace */}
          <p className="ph-mono mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3A5578]">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to === "/user" && location.pathname === "/user");
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="relative z-10 border-t border-[#1c2b3d] px-4 py-5">
          <div className="rounded-xl bg-[#1c2b3d] p-4">
            <p className="ph-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5B7DA6]">
              Signed in
            </p>

            <p className="ph-sans mt-2 font-semibold text-white">{user?.name || "Employee"}</p>

            <p className="ph-mono mt-1 text-[11px] text-[#8FA6C2]">{user?.email}</p>

            <button
              onClick={handleLogout}
              className="ph-sans mt-4 w-full rounded-lg border border-[#FF5A3C] bg-[#FF5A3C]/[0.08] px-3 py-2.5 text-xs font-semibold text-[#FF5A3C] transition hover:bg-[#FF5A3C]/[0.15]"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-[250px]" : "ml-0"
        }`}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          roleLabel="Employee"
          title={activeView === "projects" ? "My Projects" : activeView === "tasks" ? "My Tasks" : "My Dashboard"}
        />

        <main className="bg-slate-50 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accentStyles = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-xl px-2.5 py-1.5 text-xs font-semibold ${accentStyles[accent]}`}>
        {label}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>

      {actionLabel && onAction && (
        <button onClick={onAction} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Alert({ message }) {
  return <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>;
}

function Loader({ label }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export default UserDashboard;