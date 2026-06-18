import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, UserPlus, Image, ShieldAlert, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import API from '../../utils/axios';
import { FileUploadField } from '../../components/FileUpload';

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // 1. Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['shopSettings'],
    queryFn: async () => {
      const res = await API.get('/settings');
      // pre-fill local state
      const s = res.data;
      setShopForm({
        shopName: s.shopName || '',
        phone: s.phone || '',
        email: s.email || '',
        address: s.address || '',
        gstNumber: s.gstNumber || '',
        invoicePrefix: s.invoicePrefix || '',
        invoiceTerms: s.invoiceTerms ? s.invoiceTerms.join('\n') : '',
      });
      return s;
    },
  });

  // Shop settings form
  const [shopForm, setShopForm] = useState({
    shopName: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    invoicePrefix: '',
    invoiceTerms: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // New staff form
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    role: 'staff',
  });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState(false);
  const [staffError, setStaffError] = useState('');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    const formData = new FormData();
    Object.keys(shopForm).forEach((key) => {
      if (key === 'invoiceTerms') {
        const termsArr = shopForm[key].split('\n').filter(Boolean);
        formData.append(key, JSON.stringify(termsArr));
      } else {
        formData.append(key, shopForm[key]);
      }
    });

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      await API.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries(['shopSettings']);
      alert('Shop metadata settings saved.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffSuccess(false);
    setStaffError('');

    try {
      await API.post('/auth/register', staffForm);
      setStaffSuccess(true);
      setStaffForm({ email: '', password: '', role: 'staff' });
    } catch (err) {
      setStaffError(err.response?.data?.message || 'Failed to register new staff user.');
    } finally {
      setStaffLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">Loading shop settings panel...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      
      {/* 1. Shop details editor */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Settings size={18} className="text-primary-500" />
          Store Identity & Invoice Configurations
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Shop Name</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={shopForm.shopName}
                onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">GST Registration Number (GSTIN)</label>
              <input
                type="text"
                placeholder="15-digit GSTIN"
                disabled={!isAdmin}
                value={shopForm.gstNumber}
                onChange={(e) => setShopForm({ ...shopForm, gstNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Business Telephone</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={shopForm.phone}
                onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Support Email</label>
              <input
                type="email"
                required
                disabled={!isAdmin}
                value={shopForm.email}
                onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Invoice Voucher Prefix</label>
              <input
                type="text"
                placeholder="e.g. CX"
                disabled={!isAdmin}
                value={shopForm.invoicePrefix}
                onChange={(e) => setShopForm({ ...shopForm, invoicePrefix: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
              />
            </div>

            <FileUploadField
              label="Shop Logo (A4/Thermal headers)"
              id="shop-logo-upload"
              file={logoFile || settings?.logoUrl}
              setFile={setLogoFile}
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500">Shop Billing Address</label>
            <input
              type="text"
              required
              disabled={!isAdmin}
              value={shopForm.address}
              onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500 block">Invoice Terms & Conditions (One rule per line)</label>
            <textarea
              disabled={!isAdmin}
              value={shopForm.invoiceTerms}
              onChange={(e) => setShopForm({ ...shopForm, invoiceTerms: e.target.value })}
              className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2.5 text-slate-900 dark:text-white"
              rows={4}
              placeholder="e.g. Sold items cannot be returned. Only replacement within 7 days."
            />
          </div>

          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
              >
                <Save size={14} />
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. Staff register panel (Admin only) */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <UserPlus size={18} className="text-primary-500" />
          Create Staff User Accounts
        </h3>

        {!isSuperAdmin ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 text-slate-450">
            <ShieldAlert size={36} className="text-rose-500/80" />
            <h4 className="font-bold text-slate-700">Access Denied</h4>
            <p className="text-[10px]">Only the Super Admin can register new users.</p>
          </div>
        ) : (
          <form onSubmit={handleRegisterStaff} className="space-y-4">
            {staffSuccess && (
              <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded border border-emerald-500/15 flex items-center gap-1.5 font-bold">
                <Check size={14} />
                Staff registered successfully!
              </div>
            )}
            
            {staffError && (
              <div className="bg-rose-500/10 text-rose-500 p-2.5 rounded border border-rose-500/15 font-bold">
                {staffError}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Operator Email</label>
              <input
                type="email"
                required
                placeholder="e.g. staff@cellxchange.com"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Security Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Role level</label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded p-1.5"
              >
                <option value="staff">Staff Operator</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={staffLoading}
              className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus size={14} />
              {staffLoading ? 'Registering...' : 'Register Operator'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
