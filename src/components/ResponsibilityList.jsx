import { useEffect, useState, useContext } from "react";
import { db } from "../firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CATEGORY_COLORS = {
  Utilities: "var(--cat-utilities)",
  Groceries: "var(--cat-groceries)",
  Health: "var(--cat-health)",
  Maintenance: "var(--cat-maintenance)",
  Savings: "var(--cat-savings)",
  Personal: "var(--cat-personal)"
};

function ResponsibilityList() {
  const { user } = useContext(AuthContext);
  const [responsibilities, setResponsibilities] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "responsibilities"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResponsibilities(data);
    });

    return () => unsubscribe();
  }, [user]);

  // Aggregate stats
  const completedCount = responsibilities.filter(r => r.completed).length;
  const rescheduledCount = responsibilities.filter(r => r.rescheduled && !r.completed).length;
  const missedCount = responsibilities.filter(r => {
      if (!r.dueDate || r.completed || r.rescheduled) return false;
      return new Date(r.dueDate) < new Date();
  }).length;
  
  // Calculate savings
  const totalSavings = responsibilities.reduce((acc, curr) => {
    if (curr.completed && curr.allocatedFunds && curr.actualAmount !== undefined && curr.actualAmount !== null) {
        const diff = curr.allocatedFunds - curr.actualAmount;
        if (diff > 0) return acc + diff;
    }
    return acc;
  }, 0);

  const categories = Object.keys(CATEGORY_COLORS);

  // Chart Data preparation
  const chartData = categories.map(cat => {
    const total = responsibilities.filter(r => r.category === cat).length;
    return { name: cat, value: total, color: CATEGORY_COLORS[cat] };
  }).filter(d => d.value > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* 1. TOP SECTION: Stats, Savings, and Chart */}
      <section className="bottom-dash-grid">
        <div className="card">
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.25rem" }}>Activity Summary</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Task Activity Status</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.8rem 1rem", borderRadius: "8px", background: "var(--bg-completed)"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                 <span style={{ color: "var(--text-completed)" }}>&#10003;</span> Tasks Completed
              </span>
              <span style={{ fontWeight: 600, color: "var(--text-completed)" }}>{completedCount}</span>
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.8rem 1rem", borderRadius: "8px", background: "var(--bg-missed)"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                 <span style={{ color: "var(--text-missed)" }}>!</span> Missed Tasks
              </span>
              <span style={{ fontWeight: 600, color: "var(--text-missed)" }}>{missedCount}</span>
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.8rem 1rem", borderRadius: "8px", background: "var(--bg-rescheduled)"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                 <span style={{ color: "var(--text-rescheduled)" }}>&#128336;</span> Rescheduled Tasks
              </span>
              <span style={{ fontWeight: 600, color: "var(--text-rescheduled)" }}>{rescheduledCount}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.25rem" }}>Savings Overview</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Total tracked</p>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
             <div style={{
                 width: "60px", height: "60px", borderRadius: "50%", background: "#f3e8ff",
                 display: "flex", alignItems: "center", justifyContent: "center",
                 color: "var(--cat-savings)", fontSize: "1rem", fontWeight: "bold"
             }}>
                KSh
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>Total Savings</p>
                <p style={{ fontSize: "2rem", fontWeight: 600, color: "var(--cat-savings)", lineHeight: 1 }}>
                   KSh{totalSavings.toFixed(2)}
                </p>
             </div>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <span style={{ color: "var(--cat-groceries)" }}>&#8599;</span> Keep tracking your savings
          </p>
        </div>
      </section>

      {/* 2. MIDDLE SECTION: Charts */}
      <section>
        <div className="card chart-card" style={{ height: "480px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: 600, marginBottom: "0.25rem" }}>Responsibilities by Category</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-small)", marginBottom: "0.5rem" }}>Distribution of all your tasks</p>
            <div style={{ flex: 1, minHeight: 0 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      outerRadius="65%"
                      innerRadius="38%"
                      paddingAngle={5}
                      label={({ value }) => value}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: "16px", fontSize: "var(--fs-small)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                  No tasks assigned yet.
                </div>
              )}
            </div>
        </div>
      </section>

      {/* 3. BOTTOM SECTION: Categories and Tasks */}
      <section>
        <h2 className="section-title">Responsibility Categories</h2>
        <div className="categories-grid">
          {categories.map(cat => {
            const catResps = responsibilities.filter(r => r.category === cat);
            const total = catResps.length;
            const completed = catResps.filter(r => r.completed).length;
            const upcoming = total - completed;

            return (
              <div 
                key={cat} 
                className="card category-card"
                style={{
                  borderLeft: `4px solid ${CATEGORY_COLORS[cat]}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.25rem" }}>{cat}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {upcoming} upcoming &bull; {completed} completed
                  </p>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                   {upcoming === 0 ? "No upcoming tasks" : `${upcoming} tasks await`}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ paddingBottom: "2rem" }}>
        <h2 className="section-title">Upcoming Tasks</h2>
        {responsibilities.filter(r => !r.completed).length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {responsibilities
              .filter(r => !r.completed)
              .slice(0, 5) // Just show top 5 upcoming here as a preview
              .map(item => (
                <div key={item.id} className="card" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `4px solid ${CATEGORY_COLORS[item.category]}` }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {item.category} {item.dueDate && `• Due: ${item.dueDate}`}
                    </p>
                  </div>
                  <div style={{ fontSize: "1.2rem", opacity: 0.5 }}>
                     ⏳
                  </div>
                </div>
            ))}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
               <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage all tasks from the Responsibilities page.</p>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
             No upcoming responsibilities
          </div>
        )}
      </section>

    </div>
  );
}

export default ResponsibilityList;