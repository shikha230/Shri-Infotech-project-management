import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>CRM Dashboard</h1>

      <p>
        Welcome, <strong>{user?.name || user?.email}</strong>
      </p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;