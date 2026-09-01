import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");

  // ========================================
  // GET PROJECT DETAILS
  // ========================================
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/projects/${id}`);

        console.log("Project details:", response.data);

        setProject(response.data.project);
      } catch (error) {
        console.error("Get project details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load project details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // ========================================
  // DOWNLOAD DOCUMENT
  // ========================================
  const handleDownload = async (document) => {
    try {
      if (!document?.url) {
        alert("Document URL is not available.");
        return;
      }

      setDownloading(document.name);

      const response = await fetch(document.url);

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");

      link.href = blobUrl;
      link.download = document.name || "document";

      link.style.display = "none";

      window.document.body.appendChild(link);

      link.click();

      window.document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);

      alert(
        "Unable to download this document. Please try again."
      );
    } finally {
      setDownloading("");
    }
  };

  // ========================================
  // STATUS STYLE
  // ========================================
  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "On Hold":
        return "bg-orange-100 text-orange-700";

      case "Planning":
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ========================================
  // LOADING
  // ========================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading project...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================
  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">

          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || "Project not found."}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          HEADER
      ======================================== */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-6 py-5">

          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to My Projects
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                {project.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Project details and assigned team
              </p>

            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                project.status
              )}`}
            >
              {project.status}
            </span>

          </div>

        </div>

      </header>

      {/* ========================================
          MAIN
      ======================================== */}
      <main className="mx-auto max-w-6xl px-6 py-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ====================================
              MAIN CONTENT
          ==================================== */}
          <div className="space-y-6 lg:col-span-2">

            {/* DESCRIPTION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Project Description
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {project.description}
              </p>

            </section>

            {/* TECHNOLOGIES */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Technologies
              </h2>

              {project.technologies?.length > 0 ? (

                <div className="mt-4 flex flex-wrap gap-2">

                  {project.technologies.map(
                    (technology, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        {technology}
                      </span>
                    )
                  )}

                </div>

              ) : (

                <p className="mt-4 text-sm text-slate-400">
                  No technologies specified.
                </p>

              )}

            </section>

            {/* TEAM MEMBERS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <h2 className="text-lg font-bold text-slate-900">
                  Team Members
                </h2>

                <span className="text-sm text-slate-400">
                  {project.teamMembers?.length || 0}{" "}
                  {project.teamMembers?.length === 1
                    ? "member"
                    : "members"}
                </span>

              </div>

              {project.teamMembers?.length > 0 ? (

                <div className="mt-5 space-y-3">

                  {project.teamMembers.map((member) => (

                    <div
                      key={member._id}
                      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >

                      {/* AVATAR */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {member.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      {/* MEMBER INFO */}
                      <div className="min-w-0">

                        <p className="text-sm font-semibold text-slate-800">
                          {member.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {member.email}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="mt-4 text-sm text-slate-400">
                  No team members assigned.
                </p>

              )}

            </section>

            {/* PROJECT DOCUMENTS */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <h2 className="font-semibold text-slate-900">
                  Project Documents
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Documents uploaded for this project.
                </p>

              </div>

              <div className="p-6">

                {!project.documents ||
                project.documents.length === 0 ? (

                  <p className="text-sm text-slate-400">
                    No documents available for this project.
                  </p>

                ) : (

                  <div className="space-y-3">

                    {project.documents.map(
                      (document, index) => (

                        <div
                          key={
                            document._id ||
                            `${document.name}-${index}`
                          }
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >

                          {/* DOCUMENT INFORMATION */}
                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                              📄
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-700">
                                {document.name}
                              </p>

                              {document.size > 0 && (

                                <p className="mt-1 text-xs text-slate-400">

                                  {(
                                    document.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)}{" "}
                                  MB

                                </p>

                              )}

                            </div>

                          </div>

                          {/* ACTIONS */}
                          <div className="ml-4 flex shrink-0 gap-2">

                            {/* VIEW */}
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                              View
                            </a>

                            {/* DOWNLOAD */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(document)
                              }
                              disabled={
                                downloading === document.name
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
                                downloading === document.name
                                  ? "cursor-not-allowed bg-blue-400"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {downloading === document.name
                                ? "Downloading..."
                                : "Download"}
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

          </div>

          {/* ====================================
              SIDEBAR
          ===================================== */}
          <div className="space-y-6">

            {/* PROJECT INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Project Information
              </h2>

              <div className="mt-5 space-y-5">

                {/* STATUS */}
                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {project.status}
                  </p>

                </div>

                {/* TEAM SIZE */}
                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Team Size
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {project.teamSize || 0}{" "}
                    {project.teamSize === 1
                      ? "member"
                      : "members"}
                  </p>

                </div>

                {/* START DATE */}
                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {project.startDate
                      ? new Date(
                          project.startDate
                        ).toLocaleDateString("en-IN")
                      : "Not set"}
                  </p>

                </div>

                {/* END DATE */}
                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    End Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {project.endDate
                      ? new Date(
                          project.endDate
                        ).toLocaleDateString("en-IN")
                      : "Not set"}
                  </p>

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ProjectDetails;