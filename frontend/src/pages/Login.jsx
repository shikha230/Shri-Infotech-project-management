import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      login(token, user);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F3F5F7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap');

        .ph-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        .ph-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }

        .ph-grid {
          background-image:
            linear-gradient(rgba(148,180,214,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,180,214,0.14) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        @keyframes ph-draw { to { stroke-dashoffset: 0; } }
        .ph-line {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: ph-draw 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .ph-line-d1 { animation-delay: 0.15s; }
        .ph-line-d2 { animation-delay: 0.5s; }
        .ph-line-d3 { animation-delay: 0.85s; }

        @media (prefers-reduced-motion: reduce) {
          .ph-line { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>

      {/* =========================
          LEFT — BLUEPRINT PANEL (desktop only)
      ========================= */}
      <div className="ph-grid relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0B1524] px-14 py-12 lg:flex">
        {/* corner registration marks */}
        {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map(
          (pos) => (
            <svg
              key={pos}
              className={`pointer-events-none absolute ${pos} h-4 w-4 text-[#3A5578]`}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="1" />
            </svg>
          )
        )}

        {/* wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#3A5578] text-sm font-semibold text-[#FF5A3C] ph-mono">
            P
          </div>
          <span className="ph-mono text-sm uppercase tracking-[0.25em] text-[#8FA6C2]">
            Shri-Infotech
          </span>
        </div>

        {/* blueprint diagram */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <svg viewBox="0 0 340 240" className="w-full max-w-md text-[#5B7DA6]" fill="none">
            {/* column headers */}
            <rect x="16" y="8" width="90" height="20" stroke="currentColor" strokeWidth="1" />
            <rect x="130" y="8" width="90" height="20" stroke="currentColor" strokeWidth="1" />
            <rect x="244" y="8" width="90" height="20" stroke="currentColor" strokeWidth="1" />
            <text x="61" y="22" textAnchor="middle" className="ph-mono" fontSize="8" fill="currentColor">TO DO</text>
            <text x="175" y="22" textAnchor="middle" className="ph-mono" fontSize="8" fill="currentColor">IN PROGRESS</text>
            <text x="289" y="22" textAnchor="middle" className="ph-mono" fontSize="8" fill="currentColor">DONE</text>

            {/* cards */}
            <rect x="16" y="42" width="90" height="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="16" y="82" width="90" height="30" stroke="currentColor" strokeWidth="1" />
            <rect x="130" y="42" width="90" height="30" stroke="currentColor" strokeWidth="1" />
            <rect x="244" y="42" width="90" height="30" stroke="currentColor" strokeWidth="1" />
            <rect x="244" y="82" width="90" height="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />

            {/* flow lines */}
            <path
              className="ph-line ph-line-d1"
              d="M106 97 C 118 97, 118 57, 130 57"
              stroke="#FF5A3C"
              strokeWidth="1.25"
            />
            <path
              className="ph-line ph-line-d2"
              d="M220 57 C 232 57, 232 97, 244 97"
              stroke="#FF5A3C"
              strokeWidth="1.25"
            />
            <circle className="ph-line ph-line-d1" cx="130" cy="57" r="2.5" fill="#FF5A3C" stroke="none" />
            <circle className="ph-line ph-line-d2" cx="244" cy="97" r="2.5" fill="#FF5A3C" stroke="none" />

            {/* lower annotation rule */}
            <line
              className="ph-line ph-line-d3"
              x1="16"
              y1="150"
              x2="334"
              y2="150"
              stroke="#3A5578"
              strokeWidth="1"
              strokeDasharray="1 4"
            />
            <text x="16" y="168" className="ph-mono" fontSize="7.5" fill="#5B7DA6">
              FIG. 01 — WORKSPACE FLOW, TYP.
            </text>
          </svg>
        </div>

        {/* sheet footer */}
        <div className="relative z-10 border-t border-dotted border-[#3A5578] pt-4">
          <p className="ph-mono text-[10px] uppercase tracking-[0.2em] text-[#5B7DA6]">
            Sheet 01/01 — Auth Access &nbsp;·&nbsp; Scale N.T.S. &nbsp;·&nbsp; Rev A
          </p>
        </div>
      </div>

      {/* =========================
          RIGHT — FORM PANEL
      ========================= */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* mobile-only compact header */}
        <div className="ph-grid flex items-center justify-center gap-3 border-b border-[#1c2b3d] bg-[#0B1524] px-6 py-5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center border border-[#3A5578] text-xs font-semibold text-[#FF5A3C] ph-mono">
            P
          </div>
          <span className="ph-mono text-xs uppercase tracking-[0.25em] text-[#8FA6C2]">
            Shri-Infotech
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <p className="ph-mono text-xs uppercase tracking-[0.25em] text-[#FF5A3C]">
              Secure Sign-in
            </p>

            <h1 className="ph-sans mt-3 text-3xl font-extrabold tracking-tight text-[#12202E]">
              Welcome back
            </h1>

            <p className="ph-sans mt-2 text-sm text-[#5B6B7A]">
              Enter your credentials to access your workspace.
            </p>

            {error && (
              <div
                role="alert"
                className="ph-sans mt-6 border border-[#F1C4B8] bg-[#FDECE7] pl-4 pr-4 py-3 text-sm text-[#B33A1F]"
                style={{ borderLeftWidth: "3px", borderLeftColor: "#FF5A3C" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="ph-mono block text-[11px] uppercase tracking-[0.15em] text-[#5B6B7A]"
                >
                  Email
                </label>

                <div className="group relative mt-2 flex items-center border-b-2 border-[#D8DEE5] transition-colors focus-within:border-[#FF5A3C]">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#98A4B1] transition-colors group-focus-within:text-[#FF5A3C]"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M2.5 5.5h15a1 1 0 011 1v7a1 1 0 01-1 1h-15a1 1 0 01-1-1v-7a1 1 0 011-1z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path d="M2 6l8 5.5L18 6" stroke="currentColor" strokeWidth="1.3" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="ph-sans w-full bg-transparent py-2.5 pl-3 pr-2 text-sm text-[#12202E] outline-none placeholder:text-[#A6B0BA]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="ph-mono text-[11px] uppercase tracking-[0.15em] text-[#5B6B7A]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/forgot-password")}
                    className="ph-mono text-[11px] uppercase tracking-[0.1em] text-[#5B6B7A] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#FF5A3C] focus-visible:text-[#FF5A3C] focus-visible:outline-none"
                  >
                    Forgot?
                  </button>
                </div>

                <div className="group relative mt-2 flex items-center border-b-2 border-[#D8DEE5] transition-colors focus-within:border-[#FF5A3C]">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#98A4B1] transition-colors group-focus-within:text-[#FF5A3C]"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <rect x="4" y="9" width="12" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.3" />
                  </svg>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="ph-sans w-full bg-transparent py-2.5 pl-3 pr-2 text-sm text-[#12202E] outline-none placeholder:text-[#A6B0BA]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="ph-mono shrink-0 px-1 text-[10px] uppercase tracking-[0.1em] text-[#5B6B7A] transition-colors hover:text-[#FF5A3C] focus-visible:text-[#FF5A3C] focus-visible:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="ph-mono group relative mt-2 flex w-full items-center justify-center gap-2 bg-[#0B1524] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#16283C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A3C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>
            </form>

            {/* title block — signature footer */}
            <div className="ph-mono mt-10 grid grid-cols-3 border-t border-[#D8DEE5] pt-4 text-[10px] uppercase tracking-[0.1em]">
              <div>
                <p className="text-[#98A4B1]">Workspace</p>
                <p className="mt-1 text-[#12202E]">Shri-Infotech</p>
              </div>
              <div>
                <p className="text-[#98A4B1]">Encryption</p>
                <p className="mt-1 text-[#12202E]">TLS 1.3</p>
              </div>
              <div>
                <p className="text-[#98A4B1]">Rev</p>
                <p className="mt-1 text-[#12202E]">A</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
