import { useState, useContext } from "react";
import { useEffect } from "react";
import { db } from "../firebase/firestore";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import AddResponsibility from "../components/AddResponsibility";

const CATEGORY_COLORS = {
  Utilities: "var(--cat-utilities)",
  Groceries: "var(--cat-groceries)",
  Health: "var(--cat-health)",
  Maintenance: "var(--cat-maintenance)",
  Savings: "var(--cat-savings)",
  Personal: "var(--cat-personal)"
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

function Responsibilities() {
  const { user } = useContext(AuthContext);
  const [responsibilities, setResponsibilities] = useState([]);
  const [activeTab, setActiveTab] = useState("Utilities");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [checklistOpenId, setChecklistOpenId] = useState(null);
  const [showManageTabs, setShowManageTabs] = useState(false);

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

  const handleComplete = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "responsibilities", id), { completed: !currentStatus });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this responsibility?")) return;
    try {
      await deleteDoc(doc(db, "responsibilities", id));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChecklistToggle = async (item, index) => {
    const updated = (item.checklist || []).map((c, i) =>
      i === index ? { ...c, done: !c.done } : c
    );
    try {
      await updateDoc(doc(db, "responsibilities", item.id), { checklist: updated });
    } catch (error) {
      alert(error.message);
    }
  };

  const filtered = responsibilities.filter(r => r.category === activeTab);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Responsibilities</h1>
          <p className="subtitle">Manage your recurring responsibilities</p>
        </div>
        <div className="resp-header-actions">
          <button
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--border-color)" }}
            onClick={() => setShowManageTabs(!showManageTabs)}
          >
            ⚙️ Manage Tabs
          </button>
          <button
            className="btn-primary"
            style={{ background: "#0d9488", display: "flex", alignItems: "center", gap: "0.5rem" }}
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          >
            + Add Responsibility
          </button>
        </div>
      </header>

      {/* Manage Tabs Panel */}
      {showManageTabs && (
        <div className="card" style={{ marginBottom: "0" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Manage Responsibility Tabs</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>Customize your responsibility categories</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.875rem 1rem", border: "1px solid var(--border-color)", borderRadius: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    background: CATEGORY_COLORS[cat], display: "inline-block", flexShrink: 0
                  }} />
                  <span style={{ fontWeight: 600 }}>{cat}</span>
                  <span style={{
                    fontSize: "0.75rem", border: "1px solid var(--border-color)",
                    borderRadius: "6px", padding: "0.15rem 0.5rem", color: "var(--text-muted)"
                  }}>Default</span>
                </div>
                <button style={{ background: "none", color: "var(--text-muted)", fontSize: "1rem" }}>✏️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="resp-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "40px",
              fontWeight: activeTab === cat ? 600 : 400,
              background: activeTab === cat ? "white" : "transparent",
              color: "var(--text-main)",
              boxShadow: activeTab === cat ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="card" style={{ minHeight: "260px", display: "flex", flexDirection: "column", alignItems: filtered.length === 0 ? "center" : "flex-start", justifyContent: filtered.length === 0 ? "center" : "flex-start", gap: "1rem" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No responsibilities in this category yet</p>
            <button
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            >
              + Add First Responsibility
            </button>
          </div>
        ) : (
          filtered.map(item => {
            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.completed;
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} style={{
                width: "100%", border: "1px solid var(--border-color)", borderRadius: "10px",
                background: item.completed ? "#f8fdf8" : "white",
                overflow: "hidden",
                transition: "box-shadow 0.2s ease",
                boxShadow: isExpanded ? "0 4px 16px rgba(0,0,0,0.08)" : "none"
              }}>
                {/* Main Row */}
                <div className="resp-item-row" style={{
                  padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{ cursor: "pointer", flex: 1 }}
                  >
                    <p style={{
                      fontWeight: 600,
                      textDecoration: item.completed ? "line-through" : "none",
                      color: item.completed ? "var(--text-muted)" : "var(--text-main)",
                      display: "flex", alignItems: "center", gap: "0.4rem"
                    }}>
                      <span style={{
                        fontSize: "0.7rem", color: "var(--text-muted)",
                        transition: "transform 0.2s",
                        display: "inline-block",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)"
                      }}>▶</span>
                      {item.title}
                      {isOverdue && <span style={{ marginLeft: "0.25rem", color: "var(--text-missed)", fontSize: "0.8rem" }}>⚠ Overdue</span>}
                    </p>
                    {item.dueDate && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem", paddingLeft: "1.1rem" }}>Due: {item.dueDate}</p>}
                  </div>
                  <div className="resp-actions">
                    <button className="btn-secondary" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}>
                      {isOverdue ? "Reschedule" : "Edit"}
                    </button>
                    <button className="btn-secondary" onClick={() => handleComplete(item.id, item.completed)}>
                      {item.completed ? "Undo" : "✓ Complete"}
                    </button>
                    <button className="btn-secondary" style={{ color: "var(--text-missed)" }} onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expandable Detail Panel */}
                {isExpanded && (
                  <div className="resp-detail-grid" style={{
                    borderTop: "1px solid var(--border-color)",
                    padding: "1rem 1.25rem",
                    background: "var(--bg-subtle, #f9fafb)"
                  }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Description</p>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{item.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description</span>}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Recurrence</p>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{item.recurrence || "One-time"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Reminder</p>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{item.reminder || "None"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Allocated Funds</p>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{item.allocatedFunds != null ? `KSh ${item.allocatedFunds.toFixed(2)}` : <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not set</span>}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Actual Amount Spent</p>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{item.actualAmount != null ? `KSh ${item.actualAmount.toFixed(2)}` : <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not set</span>}</p>
                    </div>
                    {item.allocatedFunds != null && item.actualAmount != null && (
                      <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Savings</p>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: item.allocatedFunds - item.actualAmount >= 0 ? "var(--cat-savings)" : "var(--text-missed)" }}>
                          KSh {(item.allocatedFunds - item.actualAmount).toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Checklist — nested accordion row */}
                    {item.checklist && item.checklist.length > 0 && (() => {
                      const total = item.checklist.length;
                      const done = item.checklist.filter(c => c.done).length;
                      const isChecklistOpen = checklistOpenId === item.id;
                      return (
                        <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-color)", marginTop: "0.25rem", paddingTop: "0.5rem" }}>
                          {/* Clickable header row — styled like other info fields */}
                          <div
                            onClick={() => setChecklistOpenId(isChecklistOpen ? null : item.id)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              cursor: "pointer", userSelect: "none",
                              padding: "0.3rem 0.25rem", borderRadius: "6px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <span style={{
                                fontSize: "0.65rem", color: "var(--text-muted)",
                                display: "inline-block",
                                transition: "transform 0.2s",
                                transform: isChecklistOpen ? "rotate(90deg)" : "rotate(0deg)"
                              }}>▶</span>
                              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Checklist</p>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: done === total ? "var(--cat-savings)" : "var(--text-muted)", fontWeight: done === total ? 600 : 400 }}>
                              {done}/{total} done
                            </span>
                          </div>

                          {/* Items — only visible when open */}
                          {isChecklistOpen && (
                            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                              {/* Progress bar */}
                              <div style={{ height: "4px", borderRadius: "99px", background: "var(--border-color)", marginBottom: "0.4rem", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.round((done / total) * 100)}%`, background: "#0d9488", borderRadius: "99px", transition: "width 0.3s ease" }} />
                              </div>
                              {item.checklist.map((c, idx) => (
                                <label key={idx} style={{
                                  display: "flex", alignItems: "center", gap: "0.6rem",
                                  cursor: "pointer", padding: "0.35rem 0.5rem",
                                  borderRadius: "6px",
                                  background: c.done ? "rgba(13,148,136,0.07)" : "transparent",
                                  transition: "background 0.15s"
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={c.done}
                                    onChange={() => handleChecklistToggle(item, idx)}
                                    style={{ accentColor: "#0d9488", width: "15px", height: "15px", cursor: "pointer", flexShrink: 0 }}
                                  />
                                  <span style={{
                                    fontSize: "0.9rem",
                                    color: c.done ? "var(--text-muted)" : "var(--text-main)",
                                    textDecoration: c.done ? "line-through" : "none",
                                    transition: "all 0.2s"
                                  }}>{c.text}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && <AddResponsibility onClose={() => { setIsModalOpen(false); setEditingItem(null); }} initialData={editingItem} />}
    </div>
  );
}

export default Responsibilities;
