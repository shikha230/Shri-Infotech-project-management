import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/admin/forgot-password", {
        email: email.trim(),
      });

      setSuccess(
        response.data.message ||
          "Password reset link sent successfully."
      );

      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to send password reset email."
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

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#3A5578] text-sm font-semibold text-[#FF5A3C] ph-mono">
            P
          </div>
          <span className="ph-mono text-sm uppercase tracking-[0.25em] text-[#8FA6C2]">
            Shri-Infotech
          </span>
        </div>

        {/* recovery-flow diagram: envelope -> key -> unlocked account */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <svg viewBox="0 0 340 200" className="w-full max-w-md text-[#5B7DA6]" fill="none">
            {/* envelope */}
            <rect x="20" y="70" width="80" height="56" stroke="currentColor" strokeWidth="1" />
            <path
              className="ph-line ph-line-d1"
              d="M20 70 L60 100 L100 70"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text x="60" y="146" textAnchor="middle" className="ph-mono" fontSize="7.5" fill="currentColor">
              RESET LINK
            </text>

            {/* dashed transit line */}
            <path
              className="ph-line ph-line-d2"
              d="M100 98 C 150 98, 150 98, 200 98"
              stroke="#FF5A3C"
              strokeWidth="1.25"
              strokeDasharray="4 3"
            />

            {/* key */}
            <g className="ph-line ph-line-d3">
              <circle cx="222" cy="98" r="14" stroke="currentColor" strokeWidth="1" />
              <circle cx="222" cy="98" r="5" stroke="currentColor" strokeWidth="1" />
              <path d="M236 98 H 268 M258 98 V 108 M266 98 V 106" stroke="currentColor" strokeWidth="1" />
            </g>
            <text x="252" y="146" textAnchor="middle" className="ph-mono" fontSize="7.5" fill="currentColor">
              CREDENTIAL KEY
            </text>

            <line
              className="ph-line ph-line-d3"
              x1="20"
              y1="20"
              x2="320"
              y2="20"
              stroke="#3A5578"
              strokeWidth="1"
              strokeDasharray="1 4"
            />
            <text x="20" y="14" className="ph-mono" fontSize="7.5" fill="#5B7DA6">
              FIG. 02 — ACCOUNT RECOVERY, TYP.
            </text>
          </svg>
        </div>

        <div className="relative z-10 border-t border-dotted border-[#3A5578] pt-4">
          <p className="ph-mono text-[10px] uppercase tracking-[0.2em] text-[#5B7DA6]">
            Sheet 02/03 — Recovery &nbsp;·&nbsp; Scale N.T.S. &nbsp;·&nbsp; Rev A
          </p>
        </div>
      </div>

      {/* =========================
          RIGHT — FORM PANEL
      ========================= */}
      <div className="flex w-full flex-col lg:w-1/2">
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
              Account Recovery
            </p>

            <h1 className="ph-sans mt-3 text-3xl font-extrabold tracking-tight text-[#12202E]">
              Forgot password?
            </h1>

            <p className="ph-sans mt-2 text-sm text-[#5B6B7A]">
              Enter your admin email and we'll send you a password reset link.
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

            {success && (
              <div
                role="status"
                className="ph-sans mt-6 border border-[#BFE3CE] bg-[#EAF7EF] pl-4 pr-4 py-3 text-sm text-[#1E7A47]"
                style={{ borderLeftWidth: "3px", borderLeftColor: "#2FA765" }}
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="ph-mono block text-[11px] uppercase tracking-[0.15em] text-[#5B6B7A]"
                >
                  Admin Email
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
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    autoComplete="email"
                    className="ph-sans w-full bg-transparent py-2.5 pl-3 pr-2 text-sm text-[#12202E] outline-none placeholder:text-[#A6B0BA]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ph-mono group relative mt-2 flex w-full items-center justify-center gap-2 bg-[#0B1524] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#16283C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A3C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending
                  </>
                ) : (
                  <>
                    Send reset link
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ph-mono mt-6 flex w-full items-center justify-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#5B6B7A] transition-colors hover:text-[#FF5A3C] focus-visible:text-[#FF5A3C] focus-visible:outline-none"
            >
              ← Back to sign in
            </button>

            <div className="ph-mono mt-10 grid grid-cols-3 border-t border-[#D8DEE5] pt-4 text-[10px] uppercase tracking-[0.1em]">
              <div>
                <p className="text-[#98A4B1]">Workspace</p>
                <p className="mt-1 text-[#12202E]">Shri-Infotech</p>
              </div>
              <div>
                <p className="text-[#98A4B1]">Link expires</p>
                <p className="mt-1 text-[#12202E]">15 min</p>
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

export default ForgotPassword;
