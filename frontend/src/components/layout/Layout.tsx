import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";



export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar
        onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        sidebarOpen={mobileOpen}
        username={user?.username}
      />

      <div className="flex relative">
        <Sidebar
          isOpen={mobileOpen}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main
          className={`flex-1 transition-all duration-300 ${
            collapsed ? "lg:ml-16" : "lg:ml-64"
          }`}
        >
          <div className="p-6">
            <Outlet /> {/* 👈 ROUTED CONTENT */}
          </div>
        </main>
      </div>
    </div>
  );
}
