import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const Layout = ({ title }) => {
  const { isAuthenticated } = useAuthStore();
  const { applyTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Run on mount to ensure light/dark settings are applied to HTML element
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 transition-colors duration-200">
      {/* Admin Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="lg:pl-64">
        {/* Admin Navbar */}
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Router Content Outlet */}
        <main className="pt-24 pb-4 px-4 sm:pb-6 sm:px-6 lg:pb-8 lg:px-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
