import { useEffect, useState, useContext } from "react";
import { db } from "../firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const CATEGORIES = ["Utilities", "Groceries", "Health", "Maintenance", "Savings", "Personal"];
const STATUSES = ["Completed", "Missed", "Rescheduled"];

function History() {
  const { user } = useContext(AuthContext);
  const [responsibilities, setResponsibilities] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "responsibilities"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setResponsibilities(data);
    });
    return () => unsubscribe();
  }, [user]);

  const completedCount = responsibilities.filter(r => r.completed).length;
  const missedCount = responsibilities.filter(r => {
    if (!r.dueDate || r.completed) return false;
    return new Date(r.dueDate) < new Date();
  }).length;
  const rescheduledCount = 0;

  // Apply filters
  const filtered = responsibilities.filter(r => {
    if (filterCategory !== "All" && r.category !== filterCategory) return false;
    if (filterStatus === "Completed" && !r.completed) return false;
    if (filterStatus === "Missed") {
      const overdue = r.dueDate && new Date(r.dueDate) < new Date() && !r.completed;
      if (!overdue) return false;
    }
    if (filterStartDate && r.dueDate && r.dueDate < filterStartDate) return false;
    if (filterEndDate && r.dueDate && r.dueDate > filterEndDate) return false;
    return true;
  });

  const getStatusLabel = (r) => {
    if (r.completed) return { label: "Completed", color: "var(--text-completed)", bg: "var(--bg-completed)" };
    const overdue = r.dueDate && new Date(r.dueDate) < new Date();
    if (overdue) return { label: "Missed", color: "var(--text-missed)", bg: "var(--bg-missed)" };
    return { label: "Upcoming", color: "var(--text-rescheduled)", bg: "var(--bg-rescheduled)" };
  };

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: "1rem" }}>
        <h1>Activity History</h1>
        <p className="subtitle">View your past responsibilities and activities</p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Completed", count: completedCount, icon: "✓", iconColor: "var(--text-completed)", iconBg: "var(--bg-completed)" },
          { label: "Missed", count: missedCount, icon: "✕", iconColor: "var(--text-missed)", iconBg: "var(--bg-missed)" },
          { label: "Rescheduled", count: rescheduledCount, icon: "⏰", iconColor: "var(--text-rescheduled)", iconBg: "var(--bg-rescheduled)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%", background: s.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.iconColor, fontWeight: "bold", fontSize: "1.1rem", flexShrink: 0
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{s.label}</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Filters</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <div>
            <label className="input-label" style={{ marginBottom: "0.4rem", display: "block" }}>Category</label>
            <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label" style={{ marginBottom: "0.4rem", display: "block" }}>Status</label>
            <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label" style={{ marginBottom: "0.4rem", display: "block" }}>Start Date</label>
            <input type="date" className="input-field" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
          </div>
          <div>
            <label className="input-label" style={{ marginBottom: "0.4rem", display: "block" }}>End Date</label>
            <input type="date" className="input-field" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Activities ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No activities found matching your filters
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map(item => {
              const status = getStatusLabel(item);
              return (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.875rem 1rem", border: "1px solid var(--border-color)", borderRadius: "8px"
                }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{item.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {item.category} {item.dueDate && `• Due: ${item.dueDate}`}
                    </p>
                  </div>
                  <span style={{
                    padding: "0.25rem 0.75rem", borderRadius: "20px",
                    background: status.bg, color: status.color, fontSize: "0.8rem", fontWeight: 500
                  }}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
