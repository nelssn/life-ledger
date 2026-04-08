import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase/firestore";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

function AddResponsibility({ onClose, initialData }) {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "Utilities");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [recurrence, setRecurrence] = useState(initialData?.recurrence || "One-time");
  const [reminder, setReminder] = useState(initialData?.reminder || "None");
  const [allocatedFunds, setAllocatedFunds] = useState(initialData?.allocatedFunds || "");
  const [actualAmount, setActualAmount] = useState(initialData?.actualAmount || "");
  const [checklist, setChecklist] = useState(initialData?.checklist || []);
  const [checklistInput, setChecklistInput] = useState("");

  const addChecklistItem = () => {
    const trimmed = checklistInput.trim();
    if (!trimmed) return;
    setChecklist(prev => [...prev, { text: trimmed, done: false }]);
    setChecklistInput("");
  };

  const removeChecklistItem = (index) => {
    setChecklist(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !dueDate) {
      alert("Please fill in all required fields (Name, Category, and Date).");
      return;
    }

    try {
      const data = {
        title,
        description,
        category,
        dueDate,
        recurrence,
        reminder,
        allocatedFunds: allocatedFunds ? parseFloat(allocatedFunds) : null,
        actualAmount: actualAmount ? parseFloat(actualAmount) : null,
        checklist,
      };

      if (initialData?.id) {
        // Detect rescheduling: task was overdue and due date changed to a future date
        const wasOverdue = initialData.dueDate && new Date(initialData.dueDate) < new Date() && !initialData.completed;
        const dueDateChanged = dueDate !== initialData.dueDate;
        if (wasOverdue && dueDateChanged && new Date(dueDate) >= new Date(new Date().toDateString())) {
          data.rescheduled = true;
          data.rescheduledAt = new Date().toISOString();
        }
        await updateDoc(doc(db, "responsibilities", initialData.id), data);
      } else {
        await addDoc(collection(db, "responsibilities"), {
          ...data,
          userId: user.uid,
          completed: false,
          createdAt: new Date()
        });
      }

      onClose(); // Close modal on success
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3>{initialData ? "Edit Responsibility" : "Add Responsibility"}</h3>
            <p>{initialData ? "Update the details of your responsibility" : "Create a new task or recurring responsibility"}</p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div className="input-group">
            <label className="input-label">Task Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Pay electricity bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-field"
              placeholder="Additional details about this responsibility"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Category *</label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Utilities">Utilities</option>
              <option value="Groceries">Groceries</option>
              <option value="Health">Health</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Savings">Savings</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Scheduled Date *</label>
            <input
              type="date"
              className="input-field"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Recurrence</label>
            <select
              className="input-field"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="One-time">One-time</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Reminder</label>
            <select
              className="input-field"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            >
              <option value="None">None</option>
              <option value="1 day before">1 day before</option>
              <option value="1 week before">1 week before</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Allocated Funds (Optional)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0.00"
                value={allocatedFunds}
                onChange={(e) => setAllocatedFunds(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Actual Amount (Optional)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0.00"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
              />
            </div>
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-0.5rem" }}>
            Tip: Enter the funds you allocate for this task and the actual amount spent. The difference will be calculated as savings.
          </p>

          {/* Checklist Section */}
          <div className="input-group" style={{ marginTop: "0.5rem" }}>
            <label className="input-label">Checklist (Optional)</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                className="input-field"
                placeholder="Add a checklist item..."
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={addChecklistItem}
                style={{ whiteSpace: "nowrap" }}
              >+ Add</button>
            </div>
            {checklist.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {checklist.map((item, index) => (
                  <div key={index} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.4rem 0.6rem", background: "var(--bg-subtle, #f9fafb)",
                    borderRadius: "6px", border: "1px solid var(--border-color)"
                  }}>
                    <span style={{ flex: 1, fontSize: "0.9rem" }}>{item.text}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      style={{ background: "none", color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1, padding: "0 4px" }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary btn-full" style={{ marginTop: "0.5rem" }}>
            {initialData ? "Save Changes" : "Add Responsibility"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddResponsibility;