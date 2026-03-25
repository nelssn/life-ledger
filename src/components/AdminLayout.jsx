import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <AdminSidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
