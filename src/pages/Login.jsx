import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const docRef = doc(db, "users", userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        if (docSnap.data().role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Auto-heal: User exists in Auth but not in Firestore (created before roles were added)
        await setDoc(docRef, { email: userCredential.user.email, role: "user" });
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-main)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div className="card auth-card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a73e8", marginBottom: "0.25rem" }}>LIFE Ledger</h1>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>Welcome back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sign in to manage your responsibilities</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: "var(--text-missed)", fontSize: "0.85rem" }}>{error}</p>
          )}

          <button type="submit" className="btn-primary btn-full" style={{ marginTop: "0.5rem", padding: "0.85rem" }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/register" style={{ color: "#1a73e8", fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

