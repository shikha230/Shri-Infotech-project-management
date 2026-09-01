import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "border-[#FF5A3C] bg-white/[0.04] text-white"
        : "border-transparent text-[#8FA6C2] hover:border-[#3A5578] hover:bg-white/[0.03] hover:text-white"
    }`;

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-[#0B1524] transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap');

        .ph-mono {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
        }

        .ph-sans {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

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

          {/* Dashboard */}
          <NavLink
            to="/admin"
            end
            className={linkClass}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <rect
                x="2.5"
                y="2.5"
                width="6"
                height="6"
                stroke="currentColor"
                strokeWidth="1.3"
              />

              <rect
                x="11.5"
                y="2.5"
                width="6"
                height="6"
                stroke="currentColor"
                strokeWidth="1.3"
              />

              <rect
                x="2.5"
                y="11.5"
                width="6"
                height="6"
                stroke="currentColor"
                strokeWidth="1.3"
              />

              <rect
                x="11.5"
                y="11.5"
                width="6"
                height="6"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>

            Dashboard
          </NavLink>

          {/* Projects */}
          <NavLink
            to="/admin/projects"
            className={linkClass}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <rect
                x="3"
                y="3"
                width="14"
                height="14"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>

            Projects
          </NavLink>

          {/* Tasks */}
          <NavLink
            to="/admin/tasks"
            className={linkClass}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <rect
                x="3"
                y="3"
                width="14"
                height="14"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.3"
              />

              <path
                d="M6 7h8M6 10h8M6 13h5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>

            Tasks
          </NavLink>

        </nav>

        {/* Management */}
        <p className="ph-mono mb-3 mt-9 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3A5578]">
          Management
        </p>

        <nav className="space-y-1">

          {/* New Project */}
          <NavLink
            to="/admin/create-project"
            className={linkClass}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>

            New Project
          </NavLink>

          {/* Employees */}
          <NavLink
            to="/admin/employees"
            className={linkClass}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <circle
                cx="10"
                cy="7"
                r="3"
                stroke="currentColor"
                strokeWidth="1.3"
              />

              <path
                d="M4.5 17c.5-3 2.5-4.5 5.5-4.5s5 1.5 5.5 4.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>

            Employees
          </NavLink>

        </nav>
      </div>

      {/* Logout */}
      <div className="ph-sans relative z-10 border-t border-[#1c2b3d] p-4">

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm font-medium text-[#8FA6C2] transition-colors hover:border-[#FF5A3C] hover:bg-white/[0.03] hover:text-[#FF5A3C]"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0"
          >
            <path
              d="M8 4H4.5a1 1 0 00-1 1v10a1 1 0 001 1H8M13 14l3.5-4L13 6M6.5 10H16"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>

          Logout
        </button>

      </div>

      {/* Close Button */}
      <button
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
        className="ph-mono absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center border border-transparent text-[#8FA6C2] transition-colors hover:border-[#3A5578] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A3C]"
      >
        ×
      </button>

    </aside>
  );
}

export default Sidebar;