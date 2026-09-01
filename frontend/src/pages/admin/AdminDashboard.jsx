import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import api from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks")
        ]);

        setProjects(
          Array.isArray(projectsResponse?.data?.projects)
            ? projectsResponse.data.projects
            : Array.isArray(projectsResponse?.data?.data?.projects)
              ? projectsResponse.data.data.projects
              : []
        );

        setTasks(
          Array.isArray(tasksResponse?.data?.tasks)
            ? tasksResponse.data.tasks
            : Array.isArray(tasksResponse?.data?.data?.tasks)
              ? tasksResponse.data.data.tasks
              : []
        );
      } catch (error) {
        console.error("Failed to load dashboard data:", error);

        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
        setTasksLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(
        Array.isArray(response?.data?.projects)
          ? response.data.projects
          : Array.isArray(response?.data?.data?.projects)
            ? response.data.data.projects
            : []
      );
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(
        Array.isArray(response?.data?.tasks)
          ? response.data.tasks
          : Array.isArray(response?.data?.data?.tasks)
            ? response.data.data.tasks
            : []
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);

      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setTasksLoading(false);
    }
  };

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    (task) => task.status !== "Completed"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const planningProjects = projects.filter(
    (project) => project.status === "Planning"
  ).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Planning":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "On Hold":
        return "bg-slate-100 text-slate-600 border-slate-200";

      case "Pending":
        return "bg-orange-50 text-orange-700 border-orange-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getTaskStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-[250px]" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="p-8">

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-600">
                Dashboard
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back! 👋
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Here's what's happening with your projects.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/create-project")}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              + New Project
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Projects"
              value={loading ? "..." : totalProjects}
              icon="📁"
            />

            <StatCard
              title="In Progress"
              value={loading ? "..." : activeProjects}
              icon="⚡"
            />

            <StatCard
              title="Completed"
              value={loading ? "..." : completedProjects}
              icon="✅"
            />

            <StatCard
              title="Planning"
              value={loading ? "..." : planningProjects}
              icon="📋"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Task Overview</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{tasksLoading ? "..." : totalTasks}</h3>
                </div>
                <div className="rounded-xl bg-blue-50 px-3 py-2 text-xl">✅</div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs text-orange-600">Pending</p>
                  <p className="mt-1 text-lg font-bold text-orange-700">{tasksLoading ? "..." : pendingTasks}</p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-600">Completed</p>
                  <p className="mt-1 text-lg font-bold text-emerald-700">{tasksLoading ? "..." : completedTasks}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Task Health</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{tasksLoading ? "..." : Math.round((completedTasks / Math.max(totalTasks, 1)) * 100) + "%"}</h3>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xl">📊</div>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.max(0, Math.min(100, (completedTasks / Math.max(totalTasks, 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Projects & Tasks Grid */}
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {/* Recent Projects */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Projects
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Your latest projects
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/projects")}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  View All →
                </button>
              </div>

              {loading ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <div className="text-sm text-slate-400">
                    Loading projects...
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                    📁
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    No projects yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-400">
                    Create your first project to start managing your team's
                    work.
                  </p>

                  <button
                    onClick={() => navigate("/admin/create-project")}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">

                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project._id}
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                          📁
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {project.name}
                          </h3>

                          <p className="mt-1 max-w-xl truncate text-sm text-slate-400">
                            {project.description}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                  ))}

                </div>
              )}

            </section>

            {/* Recent Tasks */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
                  <p className="mt-1 text-sm text-slate-400">Latest tasks from your team</p>
                </div>

                <button
                  onClick={() => navigate("/admin/tasks")}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  View All →
                </button>
              </div>

              {tasksLoading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="text-sm text-slate-400">Loading tasks...</div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">📝</div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">No tasks yet</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-400">Tasks assigned to your team will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task._id}
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">📝</div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {typeof task.project === "object" ? task.project?.name : "Project"} • {typeof task.assignedTo === "object" ? task.assignedTo?.name : "Employee"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getTaskStatusStyle(task.status)}`}
                      >
                        {task.status || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;