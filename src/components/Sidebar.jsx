import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/auth";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="brand">LIFE Ledger</h2>
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
          to="/dashboard"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={onClose}
        >
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink
          to="/responsibilities"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={onClose}
        >
          <span className="icon">✅</span> Responsibilities
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={onClose}
        >
          <span className="icon">🕒</span> History
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={onClose}
        >
          <span className="icon">⚙️</span> Settings
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button
          className="help-button"
          title="Help"
          onClick={() => alert("For help, visit the Settings page.")}
        >
          ?
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
