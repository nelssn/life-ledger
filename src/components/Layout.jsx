import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const startXRef = useRef(null);
  const enableSwiping = window.matchMedia("(max-width: 900px)").matches;

  useEffect(() => {
    if (!enableSwiping) return;

    const onTouchStart = (event) => {
      startXRef.current = event.touches[0]?.clientX;
    };

    const onTouchMove = (event) => {
      if (!isSidebarOpen || startXRef.current == null) return;
      const currentX = event.touches[0]?.clientX;
      const diff = startXRef.current - currentX;
      if (diff > 80) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [enableSwiping, isSidebarOpen]);

  return (
    <div className="app-layout">
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        <h2 className="mobile-title">LIFE Ledger</h2>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}

      <main className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
