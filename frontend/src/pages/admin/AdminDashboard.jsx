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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProjects = projects.length;

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

          {/* Recent Projects */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

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
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;