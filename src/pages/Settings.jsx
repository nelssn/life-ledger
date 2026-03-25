import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase/auth";
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Settings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [pwMessage, setPwMessage] = useState({ text: "", type: "" });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ text: "", type: "" });
    if (newPassword !== confirmPassword) {
      setPwMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPwMessage({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPwMessage({ text: "Failed: " + error.message, type: "error" });
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: "0.5rem" }}>
        <h1>Settings</h1>
        <p className="subtitle">Manage your account and preferences</p>
      </header>

      {/* Account Information */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Account Information</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>Your personal account details</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Name</p>
            <p style={{ color: "var(--text-main)" }}>{displayName}</p>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Email</p>
            <p style={{ color: "var(--text-main)" }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Change Password</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>Update your account password</p>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {pwMessage.text && (
            <p style={{ fontSize: "0.85rem", color: pwMessage.type === "error" ? "var(--text-missed)" : "var(--text-completed)" }}>
              {pwMessage.text}
            </p>
          )}
          <button type="submit" className="btn-primary" style={{ width: "fit-content" }}>
            Change Password
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Notification Preferences</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>Manage how you receive reminders</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Notification settings are configured per task when creating or editing responsibilities.
        </p>
      </div>

      {/* Logout */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Logout</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>Sign out of your account</p>
        <button
          onClick={handleLogout}
          style={{
            background: "#dc2626", color: "white", border: "none",
            padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer",
            fontSize: "0.95rem"
          }}
        >
          ↪ Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;
