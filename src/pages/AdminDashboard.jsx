import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/auth";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const regularUsers = users.filter(u => u.role === "user").length;
  const admins = users.filter(u => u.role === "admin").length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ alignItems: "center" }}>
        <div>
          <h1 style={{ color: "#1f2937" }}>Admin Dashboard</h1>
          <p className="subtitle" style={{ fontSize: "1.1rem" }}>Welcome back, Admin</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-secondary" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }} onClick={() => navigate("/dashboard")}>
            View User Dashboard
          </button>
          <button className="btn-secondary" style={{ background: "#ffffff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>Total Users</h3>
            <span style={{ color: "#10b981", fontSize: "1.25rem" }}>👥</span>
          </div>
          <p className="stat-value" style={{ margin: 0 }}>{loading ? "..." : totalUsers}</p>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>All registered users</p>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>Regular Users</h3>
            <span style={{ color: "#3b82f6", fontSize: "1.25rem" }}>👤</span>
          </div>
          <p className="stat-value" style={{ margin: 0 }}>{loading ? "..." : regularUsers}</p>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Standard user accounts</p>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>Administrators</h3>
            <span style={{ color: "#8b5cf6", fontSize: "1.25rem" }}>🛡️</span>
          </div>
          <p className="stat-value" style={{ margin: 0 }}>{loading ? "..." : admins}</p>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Admin accounts</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Recent Users</h3>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>A list of all registered users in the system</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            users.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: "1px solid #f3f4f6", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: u.role === 'admin' ? "#06b6d4" : "#0ea5e9", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {u.email ? u.email[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 500 }}>{u.role === 'admin' ? "Admin" : (u.email.split('@')[0] || "User")}</h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{u.email}</p>
                  </div>
                </div>
                <div>
                  {u.role === 'admin' ? (
                    <span style={{ background: "#8b5cf6", color: "white", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span>🛡️</span> Admin
                    </span>
                  ) : (
                    <span style={{ background: "#f3f4f6", color: "#374151", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span>👤</span> User
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
