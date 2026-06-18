import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, User as UserIcon, Menu } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import API from '../utils/axios';

const Navbar = ({ title, onMenuClick }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh alerts every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await API.put('/notifications/read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const toggleNotifPanel = () => {
    setShowNotifPanel(!showNotifPanel);
    if (!showNotifPanel && unreadCount > 0) {
      handleMarkAsRead();
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 fixed top-0 right-0 left-0 lg:left-64 z-20 transition-colors duration-200">
      {/* Title & Mobile Hamburger Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm sm:text-base md:text-xl font-bold font-sans text-slate-800 dark:text-white tracking-tight truncate max-w-[140px] sm:max-w-none">{title}</h1>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4 relative">
        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Panel Trigger */}
        <button
          onClick={toggleNotifPanel}
          className="p-2 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="System Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 skeleton-item" />
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {showNotifPanel && (
          <div className="absolute right-12 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-rose-100 dark:bg-rose-950/40 text-rose-500 rounded-full font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No active stock or sales alerts</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 text-xs transition-colors ${
                      !n.isRead ? 'bg-primary-500/5 dark:bg-primary-500/5 font-medium' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          n.type === 'low_stock'
                            ? 'bg-amber-500'
                            : n.type === 'new_sale'
                            ? 'bg-emerald-500'
                            : 'bg-primary-500'
                        }`}
                      />
                      <span className="font-bold uppercase tracking-wide text-[9px] text-slate-400">
                        {n.type.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-auto">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-300 leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Separator */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

        {/* User Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || <UserIcon size={16} />}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{user?.name}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
