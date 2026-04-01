import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Handle GitHub Pages SPA redirects
if (window.location.search.startsWith('?/')) {
  const path = window.location.search.slice(2);
  window.history.replaceState(null, '', path);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/life-ledger">
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
