import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  Eye,
  Trash2,
  X,
  AlertCircle,
  FolderOpen,
  FileText,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import API from '../../utils/axios';
import { FileUploadField } from '../../components/FileUpload';

const CustomerList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdminOrManager = ['super_admin', 'admin'].includes(user?.role);

  // Search/Filters states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    gender: 'Male',
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    notes: '',
  });

  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panImage, setPanImage] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preview modal states
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [activeCustomerDocs, setActiveCustomerDocs] = useState(null);

  // 1. Fetch Customers
  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: async () => {
      const res = await API.get('/customers', {
        params: { search, page, limit: 10 },
      });
      return res.data;
    },
  });

  const customers = data?.customers || [];
  const totalPages = data?.pages || 1;

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      alert('Customer profile removed.');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to remove profile.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (customerPhoto) formData.append('customerPhoto', customerPhoto);
    if (aadhaarFront) formData.append('aadhaarFront', aadhaarFront);
    if (aadhaarBack) formData.append('aadhaarBack', aadhaarBack);
    if (panImage) formData.append('panImage', panImage);

    try {
      await API.post('/customers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries(['customers']);
      setShowAddModal(false);
      // Reset form
      setForm({
        fullName: '',
        phone: '',
        alternatePhone: '',
        gender: 'Male',
        address: '',
        aadhaarNumber: '',
        panNumber: '',
        notes: '',
      });
      setCustomerPhoto(null);
      setAadhaarFront(null);
      setAadhaarBack(null);
      setPanImage(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register customer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Customer CRM Directory</h2>
          <p className="text-xs text-slate-500">Track purchase records, identity verifications, and trade-in balances.</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setShowAddModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary-950/20"
        >
          <Plus size={16} />
          Register Customer
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by full name or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
      </div>

      {/* Grid listing */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">
            Loading customer profiles database...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-24 text-center text-xs text-slate-450">
            No registered customers found matching parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-3">Phone Number</th>
                  <th className="py-4 px-3">Aadhaar / PAN</th>
                  <th className="py-4 px-3">Address</th>
                  <th className="py-4 px-3 text-center">Verification Scans</th>
                  <th className="py-4 px-6 text-center">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-700 dark:text-slate-300">
                {customers.map((c) => {
                  const hasPhoto = !!c.customerPhoto;
                  const scansCount = [c.aadhaarFront, c.aadhaarBack, c.panImage].filter(Boolean).length;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      {/* Name Card */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-500 shrink-0 ${hasPhoto ? 'cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all' : ''}`}
                            onClick={() => {
                              if (hasPhoto) {
                                setPreviewImage(c.customerPhoto);
                                setPreviewTitle(`${c.fullName}'s Profile Photo`);
                              }
                            }}
                          >
                            {hasPhoto ? (
                              <img src={c.customerPhoto} alt="Customer Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                              c.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">{c.fullName}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{c.gender}</span>
                          </div>
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="py-4 px-3 font-semibold text-slate-900 dark:text-white">
                        <div>{c.phone}</div>
                        {c.alternatePhone && <div className="text-[10px] text-slate-400 font-normal mt-0.5">Alt: {c.alternatePhone}</div>}
                      </td>
                      {/* Aadhaar/PAN */}
                      <td className="py-4 px-3">
                        {c.aadhaarNumber && <div className="font-mono">Aadhaar: {c.aadhaarNumber}</div>}
                        {c.panNumber && <div className="font-mono text-[10px] text-slate-400 mt-0.5">PAN: {c.panNumber}</div>}
                        {!c.aadhaarNumber && !c.panNumber && <span className="text-slate-400">Not Verified</span>}
                      </td>
                      {/* Address */}
                      <td className="py-4 px-3 truncate max-w-[200px]" title={c.address}>
                        {c.address || <span className="text-slate-400">N/A</span>}
                      </td>
                      {/* Verifications Count */}
                      <td className="py-4 px-3 text-center">
                        <button
                          type="button"
                          disabled={scansCount === 0}
                          onClick={() => {
                            if (scansCount > 0) {
                              setActiveCustomerDocs(c);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            scansCount > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-500/10 cursor-pointer hover:scale-105 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                              : 'bg-amber-100 dark:bg-amber-950/30 text-amber-500 border border-amber-500/10 cursor-not-allowed'
                          }`}
                        >
                          {scansCount} Uploaded
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/customers/${c._id}`}
                            className="p-1.5 text-slate-400 hover:text-primary-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-[11px] font-bold"
                            title="View trade history & documents"
                          >
                            <Eye size={14} />
                            Open Profile
                          </Link>
                          {isAdminOrManager && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this customer profile and documents permanently?')) {
                                  deleteMutation.mutate(c._id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Delete Profile"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center text-xs">
            <span className="text-slate-450 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-md text-slate-650 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-md text-slate-650 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-xl overflow-hidden my-8 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-850 dark:text-white text-sm">Register New Customer Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-450 hover:text-slate-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-6 mt-4 flex items-center gap-2 text-rose-500 text-xs bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-500/15">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Sharma"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Alt Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alternate Phone</label>
                  <input
                    type="text"
                    placeholder="Optional secondary number"
                    value={form.alternatePhone}
                    onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Aadhaar Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Card Number</label>
                  <input
                    type="text"
                    placeholder="12-digit UID"
                    value={form.aadhaarNumber}
                    onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                {/* PAN Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Card Number</label>
                  <input
                    type="text"
                    placeholder="10-digit alphanumeric"
                    value={form.panNumber}
                    onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residential Address</label>
                <textarea
                  placeholder="Street details, Locality, City, PIN"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CRM Notes</label>
                <textarea
                  placeholder="Any trade notes or special specifications..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  rows={2}
                />
              </div>

              {/* Document Scans */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                <FileUploadField
                  label="Customer Photo"
                  id="customer-photo-upload"
                  file={customerPhoto}
                  setFile={setCustomerPhoto}
                />
                <FileUploadField
                  label="PAN Card Image"
                  id="pan-image-upload"
                  file={panImage}
                  setFile={setPanImage}
                />
                <FileUploadField
                  label="Aadhaar Card Front"
                  id="aadhaar-front-upload"
                  file={aadhaarFront}
                  setFile={setAadhaarFront}
                />
                <FileUploadField
                  label="Aadhaar Card Back"
                  id="aadhaar-back-upload"
                  file={aadhaarBack}
                  setFile={setAadhaarBack}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md shadow-primary-950/15"
                >
                  {submitting ? 'Registering CRM Profile...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Customer Document Scans Modal */}
      {activeCustomerDocs && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setActiveCustomerDocs(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-white text-xs">{activeCustomerDocs.fullName}'s Document Scans</span>
              <button 
                onClick={() => setActiveCustomerDocs(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                Close
              </button>
            </div>
            {/* Document list */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Aadhaar Card Front', url: activeCustomerDocs.aadhaarFront },
                { label: 'Aadhaar Card Back', url: activeCustomerDocs.aadhaarBack },
                { label: 'PAN Card Image', url: activeCustomerDocs.panImage },
              ].filter(doc => !!doc.url).map((doc, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{doc.label}</span>
                    <div 
                      onClick={() => {
                        setPreviewImage(doc.url);
                        setPreviewTitle(doc.label);
                      }}
                      className="w-full h-24 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 mt-2 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary-500/50 transition-all group"
                    >
                      <img src={doc.url} alt={doc.label} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(doc.url);
                      setPreviewTitle(doc.label);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setActiveCustomerDocs(null)}
                className="bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 px-4 rounded-lg text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-white text-xs">{previewTitle}</span>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                Close
              </button>
            </div>
            {/* Image Container */}
            <div className="p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950 max-h-[70vh] overflow-hidden">
              <img 
                src={previewImage} 
                alt={previewTitle} 
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors shadow"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 px-4 rounded-lg text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
