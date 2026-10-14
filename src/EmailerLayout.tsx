
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import Sidebar from "./components/Sidebar";
import "./App.css";

export default function EmailerLayout() {
  const [activePage, setActivePage] = useState("Dashboard");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={(page: string) => {
          setActivePage(page);
          const paths: Record<string, string> = {
            Dashboard: "/",
            Contacts: "/contacts",
            Templates: "/templates",
            Campaigns: "/campaigns",
            Settings: "/settings",
          };
          navigate(paths[page] || "/");
        }}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Manage your email marketing in one place.</p>
          </div>

          <div className="topbar-right">
            <Bell size={20} />
            <div>
              <strong>
                {JSON.parse(localStorage.getItem("user") || "{}").name || "Admin"}
              </strong>
              <p className="muted">Emailer User</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={logout}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
