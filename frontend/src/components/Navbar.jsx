import { useAuth } from "../context/AuthContext";

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  const firstLetter =
    user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur lg:px-8">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        {/* Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? "☰" : "☰"}
        </button>

        {/* Workspace */}
        <div>
          <p className="text-xs font-medium text-slate-400">
            Workspace
          </p>

          <h2 className="text-sm font-semibold text-slate-800">
            Project Management
          </h2>
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
  
         


        {/* Divider */}
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* User */}
        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "Admin"}
            </p>

            <p className="text-xs text-slate-400">
              Administrator
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
            {firstLetter}
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;