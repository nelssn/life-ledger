import { useState } from "react";
import AddResponsibility from "../components/AddResponsibility";
import ResponsibilityList from "../components/ResponsibilityList";

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Overview of your life responsibilities</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
           + Add Responsibility
        </button>
      </header>

      <ResponsibilityList />

      {isModalOpen && (
        <AddResponsibility onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default Dashboard;