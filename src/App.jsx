import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';

// Admin dashboard pages
import Overview from './pages/dashboard/Overview';
import InventoryList from './pages/inventory/InventoryList';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import SaleForm from './pages/billing/SaleForm';
import PurchaseForm from './pages/billing/PurchaseForm';
import CMSDashboard from './pages/cms/CMSDashboard';
import ReportsPage from './pages/reports/ReportsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AuditLogs from './pages/settings/AuditLogs';
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
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

        <Route element={<Layout title="New Device Purchase Inward" />}>
          <Route path="/admin/purchases" element={<PurchaseForm />} />
        </Route>

        <Route element={<Layout title="CMS Website Editor" />}>
          <Route path="/admin/cms" element={<CMSDashboard />} />
        </Route>

        <Route element={<Layout title="Business Reports Center" />}>
          <Route path="/admin/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<Layout title="Advanced Analytics Insights" />}>
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route element={<Layout title="User Staff Audit Logs" />}>
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
        </Route>

        <Route element={<Layout title="Global Store Settings" />}>
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
