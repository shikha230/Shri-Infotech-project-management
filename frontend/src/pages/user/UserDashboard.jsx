import { useAuth } from "../../context/AuthContext";

function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>User Dashboard</h1>

      <p>
        Welcome, <strong>{user?.name}</strong>
      </p>

      <p>Role: User</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default UserDashboard;