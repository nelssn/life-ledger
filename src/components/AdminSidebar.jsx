import { NavLink } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "#10b981", fontSize: "1.25rem" }}>🛡️</span>
        <h2 className="brand" style={{ color: "#10b981", margin: 0 }}>Admin Panel</h2>
        <button
          type="button"
          className="close-sidebar-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={onClose}
        >
          <span className="icon">🎛️</span> Admin Dashboard
        </NavLink>
        {/* User Management removed as per user request */}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
