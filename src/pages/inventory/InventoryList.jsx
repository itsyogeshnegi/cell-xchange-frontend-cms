import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  SlidersHorizontal,
  FileDown,
  FileUp,
  Trash2,
  Edit,
  Eye,
  X,
  PlusCircle,
  Barcode,
  QrCode,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import API from '../../utils/axios';
import { openProtectedFile } from '../../utils/download';
import { MultipleFileUploadField, ExcelFileUploadField } from '../../components/FileUpload';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendHost = apiURL.replace('/api', '');
  return `${backendHost}${url}`;
};

const InventoryList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdminOrManager = ['super_admin', 'admin'].includes(user?.role);

  // States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(null); // stores code modal details ({ item })
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Form States for Add/Edit
  const [form, setForm] = useState({
    productType: 'mobile',
    brand: '',
    model: '',
    color: '',
    ram: '',
    storage: '',
    processor: '',
    batteryHealth: '',
    imei1: '',
    imei2: '',
    serialNumber: '',
    condition: 'Excellent',
    purchasePrice: '',
    sellingPrice: '',
    warrantyStatus: 'Shop Warranty',
    accessoriesIncluded: [],
    deviceStatus: 'Available',
  });
  const [accessoryInput, setAccessoryInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Inventory Data (using React Query)
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search, statusFilter, typeFilter, page],
    queryFn: async () => {
      const res = await API.get('/inventory', {
        params: {
          search,
          deviceStatus: statusFilter,
          productType: typeFilter,
          page,
          limit: 10,
        },
      });
      return res.data;
    },
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      alert('Inventory item deleted successfully.');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete item.');
    },
  });

  // Open Modal Helpers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      productType: 'mobile',
      brand: '',
      model: '',
      color: '',
      ram: '',
      storage: '',
      processor: '',
      batteryHealth: '',
      imei1: '',
      imei2: '',
      serialNumber: '',
      condition: 'Excellent',
      purchasePrice: '',
      sellingPrice: '',
      warrantyStatus: 'Shop Warranty',
      accessoriesIncluded: [],
      deviceStatus: 'Available',
    });
    setImageFiles([]);
    setErrorMsg('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      productType: item.productType || 'mobile',
      brand: item.brand || '',
      model: item.model || '',
      color: item.color || '',
      ram: item.ram || '',
      storage: item.storage || '',
      processor: item.processor || '',
      batteryHealth: item.batteryHealth || '',
      imei1: item.imei1 || '',
      imei2: item.imei2 || '',
      serialNumber: item.serialNumber || '',
      condition: item.condition || 'Excellent',
      purchasePrice: item.purchasePrice || '',
      sellingPrice: item.sellingPrice || '',
      warrantyStatus: item.warrantyStatus || 'Shop Warranty',
      accessoriesIncluded: item.accessoriesIncluded || [],
      deviceStatus: item.deviceStatus || 'Available',
    });
    setImageFiles([]);
    setErrorMsg('');
    setShowAddEditModal(true);
  };

  // Submit Handler (Multipart Form Data for images)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === 'accessoriesIncluded') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

    try {
      if (editingItem) {
        await API.put(`/inventory/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/inventory', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      queryClient.invalidateQueries(['inventory']);
      setShowAddEditModal(false);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add accessory helper
  const addAccessory = () => {
    if (accessoryInput.trim() && !form.accessoriesIncluded.includes(accessoryInput.trim())) {
      setForm({
        ...form,
        accessoriesIncluded: [...form.accessoriesIncluded, accessoryInput.trim()],
      });
      setAccessoryInput('');
    }
  };

  const removeAccessory = (index) => {
    setForm({
      ...form,
      accessoriesIncluded: form.accessoriesIncluded.filter((_, i) => i !== index),
    });
  };

  // Bulk Excel Import Handler
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    setImportError('');

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      await API.post('/inventory/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries(['inventory']);
      setShowImportModal(false);
      alert('Bulk inventory import processed successfully!');
    } catch (err) {
      setImportError(err.response?.data?.message || 'Failed to parse inventory spreadsheet file.');
    } finally {
      setImportLoading(false);
    }
  };

  // Direct Excel download url
  const handleExport = () => {
    openProtectedFile('/inventory/export');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Stock Catalog</h2>
          <p className="text-xs text-slate-500">Manage device specifications, IMEIs, and print barcodes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileDown size={14} />
            Export Excel
          </button>
          <button
            onClick={() => {
              setImportFile(null);
              setImportError('');
              setShowImportModal(true);
            }}
            className="bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileUp size={14} />
            Import Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary-950/20"
          >
            <Plus size={16} />
            Add Device
          </button>
        </div>
      </div>

      {/* 2. Filters segment */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by model, brand, or IMEI..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>

        {/* Multi-Filters */}
        <div className="flex w-full md:w-auto gap-3 items-center justify-end">
          <SlidersHorizontal className="text-slate-400" size={16} />
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Repair">In Repair</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            <option value="mobile">Mobiles</option>
            <option value="laptop">Laptops</option>
          </select>
        </div>
      </div>

      {/* 3. Catalog Listing Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">
            Fetching active inventory stock records...
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center text-xs text-slate-450">
            No stock items matched your search query or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Device Specifications</th>
                  <th className="py-4 px-3">Unique IMEI / S/N</th>
                  <th className="py-4 px-3">Condition</th>
                  <th className="py-4 px-3 text-right">Inward Cost</th>
                  <th className="py-4 px-3 text-right">Selling Price</th>
                  <th className="py-4 px-3 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-700 dark:text-slate-300">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    {/* Device Specs */}
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center gap-3">
                        {item.images && item.images.length > 0 ? (
                          <div 
                            className="w-12 h-12 rounded-lg bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                            onClick={() => {
                              setPreviewImage(getImageUrl(item.images[0]));
                              setPreviewTitle(`${item.brand} ${item.model}`);
                            }}
                          >
                            <img src={getImageUrl(item.images[0])} alt={`${item.brand} ${item.model}`} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                            No Img
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.brand} {item.model}
                          </div>
                          <div className="text-[10px] text-slate-450 mt-0.5 flex gap-2 capitalize">
                            <span>Type: {item.productType}</span>
                            <span>•</span>
                            <span>Specs: {item.ram}GB / {item.storage}GB</span>
                            {item.color && (
                              <>
                                <span>•</span>
                                <span>Color: {item.color}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* IMEI / SN */}
                    <td className="py-4 px-3 font-mono text-[11px] leading-relaxed">
                      {item.imei1 && <div>I1: {item.imei1}</div>}
                      {item.imei2 && <div>I2: {item.imei2}</div>}
                      {item.serialNumber && <div>S/N: {item.serialNumber}</div>}
                    </td>
                    {/* Condition */}
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.condition === 'New'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-500/20'
                          : item.condition === 'Excellent'
                          ? 'bg-primary-100 dark:bg-primary-950/40 text-primary-500 border border-primary-500/20'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-500 border border-amber-500/20'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    {/* Inward Cost */}
                    <td className="py-4 px-3 text-right font-semibold">₹{item.purchasePrice.toLocaleString()}</td>
                    {/* Selling Price */}
                    <td className="py-4 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{item.sellingPrice.toLocaleString()}
                    </td>
                    {/* Status */}
                    <td className="py-4 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.deviceStatus === 'Available'
                          ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-500/10'
                          : item.deviceStatus === 'Reserved'
                          ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-500 border border-amber-500/10'
                          : item.deviceStatus === 'Sold'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-700/20'
                          : 'bg-rose-105 dark:bg-rose-950/30 text-rose-500 border border-rose-500/10'
                      }`}>
                        {item.deviceStatus}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Barcode / QR triggers */}
                        <button
                          onClick={() => setShowCodeModal({ item })}
                          className="p-1.5 text-slate-400 hover:text-primary-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Generate Barcode / QR Label"
                        >
                          <Barcode size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Specs"
                        >
                          <Edit size={15} />
                        </button>
                        {isAdminOrManager && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this stock item permanently?')) {
                                deleteMutation.mutate(item._id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Stock"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center text-xs">
            <span className="text-slate-450 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-slate-650 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-slate-650 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-850 dark:text-white text-sm">
                {editingItem ? 'Edit Device Specifications' : 'Inward New Device to Stock'}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mx-6 mt-4 flex items-center gap-2 text-rose-500 text-xs bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-500/15">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Type</label>
                  <select
                    value={form.productType}
                    onChange={(e) => setForm({ ...form, productType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="laptop">Laptop</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Status</label>
                  <select
                    value={form.deviceStatus}
                    onChange={(e) => setForm({ ...form, deviceStatus: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Repair">In Repair</option>
                  </select>
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 Pro"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* RAM */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RAM (GB)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 6"
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Storage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage (GB)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 128"
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Color */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Graphite"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Condition */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition Grade</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="New">New / Open Box</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair / Scratched</option>
                  </select>
                </div>

                {/* IMEI 1 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IMEI 1</label>
                  <input
                    type="text"
                    placeholder="15-digit IMEI"
                    value={form.imei1}
                    onChange={(e) => setForm({ ...form, imei1: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* IMEI 2 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IMEI 2</label>
                  <input
                    type="text"
                    placeholder="Second IMEI (optional)"
                    value={form.imei2}
                    onChange={(e) => setForm({ ...form, imei2: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serial Number</label>
                  <input
                    type="text"
                    placeholder="Mainly for laptops"
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Battery Health */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Battery Health (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 88"
                    value={form.batteryHealth}
                    onChange={(e) => setForm({ ...form, batteryHealth: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Purchase Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Cost (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="Original buy price"
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Selling Price (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="Retail sale price"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Processor */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Processor / Chipset</label>
                <input
                  type="text"
                  placeholder="e.g. Apple A15 Bionic or Intel Core i7"
                  value={form.processor}
                  onChange={(e) => setForm({ ...form, processor: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white"
                />
              </div>

              {/* Accessories tags input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Included Accessories</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add item (e.g. Charger, Original Box)..."
                    value={accessoryInput}
                    onChange={(e) => setAccessoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAccessory())}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addAccessory}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Add Accessory
                  </button>
                </div>
                {form.accessoriesIncluded.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.accessoriesIncluded.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border border-slate-250/20"
                      >
                        {tag}
                        <button type="button" onClick={() => removeAccessory(idx)}>
                          <X size={10} className="hover:text-rose-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image files upload */}
              <MultipleFileUploadField
                label="Device Gallery Images"
                id="device-gallery-images"
                files={imageFiles}
                setFiles={setImageFiles}
              />

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md shadow-primary-950/15"
                >
                  {submitting ? 'Submitting Specifications...' : editingItem ? 'Save Updates' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-bold text-slate-850 dark:text-white text-sm">Bulk Stock Excel Import</span>
              <button onClick={() => setShowImportModal(false)} className="text-slate-450">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your inventory Excel sheet (`.xlsx` or `.xls`). The table headers should match standard templates:
                <span className="font-mono bg-slate-105 dark:bg-slate-950 p-1 rounded block text-[9px] mt-1.5 leading-normal">
                  Brand, Model, ProductType, Ram, Storage, PurchasePrice, SellingPrice, Condition, IMEI1, SerialNumber
                </span>
              </p>

              {importError && (
                <div className="flex items-start gap-2 text-rose-500 text-xs bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-500/15">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              <ExcelFileUploadField
                label="Select Excel Sheet"
                id="excel-file-import"
                file={importFile}
                setFile={setImportFile}
              />

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-5 py-2 rounded-lg text-xs font-bold"
                >
                  {importLoading ? 'Processing Spreadsheet...' : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Barcode / QR Label Preview Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-bold text-slate-850 dark:text-white text-sm">Product Codes & QR Label</span>
              <button onClick={() => setShowCodeModal(null)} className="text-slate-450 hover:text-slate-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center space-y-6 text-center">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {showCodeModal.item.brand} {showCodeModal.item.model}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  IMEI/SN: {showCodeModal.item.imei1 || showCodeModal.item.serialNumber || 'N/A'}
                </p>
              </div>

              {/* Barcode Render */}
              <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200 w-full flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Standard 1D Barcode</span>
                {showCodeModal.item.barcodeUrl ? (
                  <img src={showCodeModal.item.barcodeUrl} alt="1D Barcode Label" className="max-h-12 max-w-full" />
                ) : (
                  <div className="text-[10px] text-slate-450 py-3">No barcode URL compiled</div>
                )}
              </div>

              {/* QR Code Render */}
              <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200 w-full flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">2D QR Code</span>
                {showCodeModal.item.qrCodeUrl ? (
                  <img src={showCodeModal.item.qrCodeUrl} alt="QR Code Label" className="w-24 h-24" />
                ) : (
                  <div className="text-[10px] text-slate-450 py-3">No QR code compiled</div>
                )}
              </div>

              <div className="w-full flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Print Label
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Close
                </button>
              </div>
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
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-bold text-slate-850 dark:text-white text-xs">{previewTitle}</span>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="text-slate-450 hover:text-slate-750 dark:hover:text-white font-bold"
              >
                Close
              </button>
            </div>
            {/* Image Container */}
            <div className="p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-955 max-h-[70vh] overflow-hidden">
              <img 
                src={previewImage} 
                alt={previewTitle} 
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
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
                className="bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 px-4 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
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

export default InventoryList;
