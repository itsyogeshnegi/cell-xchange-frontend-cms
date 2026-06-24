import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Beautiful loading skeleton/spinner for lazy-loaded pages
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider animate-pulse">
      Loading interface...
    </span>
  </div>
);

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));

// Admin dashboard pages
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const InventoryList = lazy(() => import('./pages/inventory/InventoryList'));
const CustomerList = lazy(() => import('./pages/customers/CustomerList'));
const CustomerDetail = lazy(() => import('./pages/customers/CustomerDetail'));
const SaleForm = lazy(() => import('./pages/billing/SaleForm'));
const CMSDashboard = lazy(() => import('./pages/cms/CMSDashboard'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<Login />} />

          {/* Admin Dashboard Protected Routes */}
          <Route element={<Layout title="Dashboard Overview" />}>
            <Route path="/admin" element={<Overview />} />
          </Route>

          <Route element={<Layout title="Inventory Stock Management" />}>
            <Route path="/admin/inventory" element={<InventoryList />} />
          </Route>

          <Route element={<Layout title="Customer CRM Directory" />}>
            <Route path="/admin/customers" element={<CustomerList />} />
            <Route path="/admin/customers/:id" element={<CustomerDetail />} />
          </Route>

          <Route element={<Layout title="New Sales Invoice Billing" />}>
            <Route path="/admin/sales" element={<SaleForm />} />
          </Route>


          <Route element={<Layout title="CMS Website Editor" />}>
            <Route path="/admin/cms" element={<CMSDashboard />} />
          </Route>

          <Route element={<Layout title="Business Reports Center" />}>
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>


          <Route element={<Layout title="Global Store Settings" />}>
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

