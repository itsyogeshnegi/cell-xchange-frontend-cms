import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Download,
  User,
  Smartphone,
  PlusCircle,
  X,
  CreditCard,
  CheckCircle,
  FileText,
  Search,
  AlertCircle,
} from 'lucide-react';
import API from '../../utils/axios';
import { openProtectedFile } from '../../utils/download';

const PurchaseForm = () => {
  const queryClient = useQueryClient();

  // 1. Customer linkage states
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Full customer profile form (if creating new customer)
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    gender: 'Male',
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    notes: '',
  });

  // Customer identity files
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panImage, setPanImage] = useState(null);

  // 2. Device inward details states
  const [deviceForm, setDeviceForm] = useState({
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
  });

  const [accessories, setAccessories] = useState([]);
  const [accessoryInput, setAccessoryInput] = useState('');
  const [deviceImages, setDeviceImages] = useState([]);

  // 3. Payment Mode
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Transaction Status
  const [loading, setLoading] = useState(false);
  const [completedPurchase, setCompletedPurchase] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Autocomplete customer query
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (customerSearch.trim().length >= 2) {
        try {
          const res = await API.get(`/customers?search=${customerSearch.trim()}`);
          setSearchResults(res.data.customers || []);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  const addAccessory = () => {
    if (accessoryInput.trim() && !accessories.includes(accessoryInput.trim())) {
      setAccessories([...accessories, accessoryInput.trim()]);
      setAccessoryInput('');
    }
  };

  const removeAccessory = (index) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData();

    // Attach Customer details
    if (selectedCustomer) {
      formData.append('customerId', selectedCustomer._id);
    } else {
      Object.keys(customerForm).forEach((key) => {
        formData.append(key, customerForm[key]);
      });
      if (customerPhoto) formData.append('customerPhoto', customerPhoto);
      if (aadhaarFront) formData.append('aadhaarFront', aadhaarFront);
      if (aadhaarBack) formData.append('aadhaarBack', aadhaarBack);
      if (panImage) formData.append('panImage', panImage);
    }

    // Attach Device details
    Object.keys(deviceForm).forEach((key) => {
      formData.append(key, deviceForm[key]);
    });
    formData.append('accessoriesIncluded', JSON.stringify(accessories));
    formData.append('paymentMethod', paymentMethod);

    // Attach Device photos
    for (let i = 0; i < deviceImages.length; i++) {
      formData.append('deviceImages', deviceImages[i]);
    }

    try {
      const res = await API.post('/purchases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCompletedPurchase(res.data);
      
      // Reset forms
      setSelectedCustomer(null);
      setCustomerSearch('');
      setCustomerForm({
        fullName: '',
        phone: '',
        alternatePhone: '',
        gender: 'Male',
        address: '',
        aadhaarNumber: '',
        panNumber: '',
        notes: '',
      });
      setDeviceForm({
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
      });
      setAccessories([]);
      setDeviceImages([]);
      queryClient.invalidateQueries(['inventory']);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to process inward purchase trade-in.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    if (!completedPurchase) return;
    openProtectedFile(`/purchases/${completedPurchase._id}/pdf`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      {/* Left Columns: Customer & Device details */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* SECTION 1: Seller Customer profile */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User size={18} className="text-primary-500" />
            1. Seller Profile (CRM linkage)
          </h3>

          {!selectedCustomer && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Link an existing customer by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-205 rounded-lg py-2 pl-9 pr-4 focus:outline-none dark:text-white"
                />
                <Search className="absolute left-3 top-3 text-slate-400" size={14} />
              </div>

              {searchResults.length > 0 && (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {searchResults.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setSearchResults([]);
                        setCustomerSearch('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex justify-between items-center text-xs"
                    >
                      <span className="font-bold text-slate-850 dark:text-white">{c.fullName}</span>
                      <span className="text-slate-450">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* CRM registration form */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Register Seller Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Seller Full Name *</label>
                    <input
                      type="text"
                      required={!selectedCustomer}
                      value={customerForm.fullName}
                      onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Gender</label>
                      <select
                        value={customerForm.gender}
                        onChange={(e) => setCustomerForm({ ...customerForm, gender: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Phone *</label>
                      <input
                        type="text"
                        required={!selectedCustomer}
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Aadhaar Card Number</label>
                    <input
                      type="text"
                      placeholder="12-digit number"
                      value={customerForm.aadhaarNumber}
                      onChange={(e) => setCustomerForm({ ...customerForm, aadhaarNumber: e.target.value })}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">PAN Card Number</label>
                    <input
                      type="text"
                      placeholder="10-digit alphanumeric"
                      value={customerForm.panNumber}
                      onChange={(e) => setCustomerForm({ ...customerForm, panNumber: e.target.value })}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Residential Address</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
                  />
                </div>

                {/* Identity documents uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-800 pt-3 text-[10px]">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Seller Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => setCustomerPhoto(e.target.files[0])} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Aadhaar Front</label>
                    <input type="file" accept="image/*" onChange={(e) => setAadhaarFront(e.target.files[0])} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Aadhaar Back</label>
                    <input type="file" accept="image/*" onChange={(e) => setAadhaarBack(e.target.files[0])} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">PAN Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setPanImage(e.target.files[0])} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCustomer && (
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedCustomer.fullName}</div>
                <div className="text-slate-450 mt-0.5">Phone: {selectedCustomer.phone} | Address: {selectedCustomer.address || 'N/A'}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-rose-500 font-bold hover:underline"
              >
                Change Seller
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: Traded Device specification */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Smartphone size={18} className="text-primary-500" />
            2. Device Specifications (Inward Stock Profile)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Category</label>
              <select
                value={deviceForm.productType}
                onChange={(e) => setDeviceForm({ ...deviceForm, productType: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              >
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Condition Grade</label>
              <select
                value={deviceForm.condition}
                onChange={(e) => setDeviceForm({ ...deviceForm, condition: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none font-medium"
              >
                <option value="New">New / Open Box</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair / Scratched</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Brand *</label>
              <input
                type="text"
                required
                placeholder="e.g. OnePlus"
                value={deviceForm.brand}
                onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Model *</label>
              <input
                type="text"
                required
                placeholder="e.g. Nord CE 3 Lite"
                value={deviceForm.model}
                onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">RAM (GB) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 8"
                value={deviceForm.ram}
                onChange={(e) => setDeviceForm({ ...deviceForm, ram: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Storage (GB) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 128"
                value={deviceForm.storage}
                onChange={(e) => setDeviceForm({ ...deviceForm, storage: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">IMEI 1 *</label>
              <input
                type="text"
                required
                placeholder="15-digit barcode number"
                value={deviceForm.imei1}
                onChange={(e) => setDeviceForm({ ...deviceForm, imei1: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">IMEI 2</label>
              <input
                type="text"
                placeholder="Optional second IMEI"
                value={deviceForm.imei2}
                onChange={(e) => setDeviceForm({ ...deviceForm, imei2: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Color</label>
              <input
                type="text"
                placeholder="e.g. Black"
                value={deviceForm.color}
                onChange={(e) => setDeviceForm({ ...deviceForm, color: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Serial Number</label>
              <input
                type="text"
                value={deviceForm.serialNumber}
                onChange={(e) => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Battery Health (%)</label>
              <input
                type="number"
                placeholder="e.g. 91"
                value={deviceForm.batteryHealth}
                onChange={(e) => setDeviceForm({ ...deviceForm, batteryHealth: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5"
              />
            </div>
          </div>

          {/* Processor & Warranty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Processor / Processor Model</label>
              <input
                type="text"
                value={deviceForm.processor}
                onChange={(e) => setDeviceForm({ ...deviceForm, processor: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Warranty Status</label>
              <input
                type="text"
                placeholder="e.g. 6 Months Brand Warranty remaining"
                value={deviceForm.warrantyStatus}
                onChange={(e) => setDeviceForm({ ...deviceForm, warrantyStatus: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5"
              />
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500 block">Accessories Handed In</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add item (e.g. Charger box, bill)..."
                value={accessoryInput}
                onChange={(e) => setAccessoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAccessory())}
                className="flex-1 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5"
              />
              <button
                type="button"
                onClick={addAccessory}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 rounded"
              >
                Add
              </button>
            </div>
            {accessories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {accessories.map((acc, index) => (
                  <span
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border border-slate-200/50"
                  >
                    {acc}
                    <button type="button" onClick={() => removeAccessory(index)}>
                      <X size={10} className="hover:text-rose-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Device Images */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500 block">Device Verification Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setDeviceImages(e.target.files)}
              className="w-full text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 p-2.5 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Pricing, Checkout & Success print options */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard size={18} className="text-primary-500" />
            Trade-in Payout details
          </h3>

          <div className="space-y-3">
            {/* Purchase cost */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Inward Purchase Price Paid *</label>
              <input
                type="number"
                required
                placeholder="Amount paid to seller"
                value={deviceForm.purchasePrice}
                onChange={(e) => setDeviceForm({ ...deviceForm, purchasePrice: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>

            {/* Target selling price */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Target Selling Retail Price *</label>
              <input
                type="number"
                required
                placeholder="Estimated listing price"
                value={deviceForm.sellingPrice}
                onChange={(e) => setDeviceForm({ ...deviceForm, sellingPrice: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>

            {/* Payout method */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Payment Payout Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              >
                <option value="Cash">Cash in Hand</option>
                <option value="UPI">UPI Transfer</option>
                <option value="Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-500 text-[10px] bg-rose-500/5 p-2.5 rounded border border-rose-500/15">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? 'Processing Inward Voucher...' : 'Complete Inward Purchase'}
          </button>
        </div>
      </div>

      {/* Success Inward print modal */}
      {completedPurchase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-sm p-6 space-y-6 text-center shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 mb-3 border border-emerald-500/20">
                <CheckCircle size={28} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Trade-in Voucher Generated!</h3>
              <p className="text-xs text-slate-450 mt-1">Voucher Number: {completedPurchase.purchaseNumber}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePrintPDF}
                className="w-full bg-primary-650 hover:bg-primary-600 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow"
              >
                <FileText size={16} />
                Download Purchase Voucher PDF
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setCompletedPurchase(null)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2 px-5 rounded-lg text-xs hover:opacity-90 transition-opacity"
              >
                Close & Start New Inward
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default PurchaseForm;
