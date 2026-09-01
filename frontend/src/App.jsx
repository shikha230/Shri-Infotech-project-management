import { Navigate, Route, Routes } from "react-router-dom";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import CreateProject from "./pages/admin/CreateProject";
import ProjectDetails from "./pages/user/ProjectDetails";
import UserDashboard from "./pages/user/UserDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import { useAuth } from "./context/AuthContext";
import Employees from "./pages/admin/Employees";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ================= ADMIN ROUTES ================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTasks />
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin/employees"
  element={<Employees />}
/>

      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProjects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-project"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateProject />
          </ProtectedRoute>
        }
      />

      {/* ================= USER ROUTES ================= */}

      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <UserDashboard initialView="dashboard" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/projects"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <UserDashboard initialView="projects" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/tasks"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <UserDashboard initialView="tasks" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/projects/:id"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />

      {/* ================= DEFAULT ================= */}

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;