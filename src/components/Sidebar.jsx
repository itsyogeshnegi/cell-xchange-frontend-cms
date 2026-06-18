import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Smartphone,
  Users,
  CreditCard,
  Download,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const activePath = location.pathname;

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { name: 'Inventory Stock', path: '/admin/inventory', icon: Smartphone, roles: ['admin', 'staff'] },
    { name: 'Customers (CRM)', path: '/admin/customers', icon: Users, roles: ['admin', 'staff'] },
    { name: 'Billing Sale', path: '/admin/sales', icon: CreditCard, roles: ['admin', 'staff'] },
    { name: 'Purchase Inward', path: '/admin/purchases', icon: Download, roles: ['admin', 'staff'] },
    { name: 'CMS Website', path: '/admin/cms', icon: FileText, roles: ['admin'] },
    { name: 'Reports', path: '/admin/reports', icon: FileText, roles: ['admin'] },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
    { name: 'Shop Settings', path: '/admin/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter((item) => 
    user?.role === 'super_admin' || item.roles.includes(user?.role)
  );

  return (
    <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <span className="text-xl font-bold font-sans tracking-wide text-white flex items-center gap-2">
          <span className="bg-primary-500 text-white p-1 rounded-lg text-sm">CX</span>
          Cell Xchange
        </span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* User Role Card */}
      <div className="p-4 mx-4 my-3 bg-slate-800/50 rounded-xl border border-slate-800 flex flex-col">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed In As</span>
        <span className="text-sm font-bold text-white truncate mt-0.5">{user?.name}</span>
        <span className="text-[10px] font-medium text-primary-400 capitalize mt-0.5 px-2 py-0.5 bg-primary-950/40 rounded-full w-max border border-primary-900/30">
          {user?.role}
        </span>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 w-full transition-all duration-150"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
