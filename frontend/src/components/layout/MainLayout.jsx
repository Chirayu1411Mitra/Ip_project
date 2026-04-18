// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Automatically close the sidebar on mobile when navigating to a new route
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar Wrapper */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Pass an optional onClose prop to Sidebar if you have internal close buttons */}
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        {/* Mobile Top Bar (Visible only on small screens) */}
        <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-[#7C3AED] tracking-tight">
              CampusConnect
            </span>
          </div>
        </div>

        <Header />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;