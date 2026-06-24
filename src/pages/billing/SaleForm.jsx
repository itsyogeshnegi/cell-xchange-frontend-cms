import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  User,
  Plus,
  Trash2,
  Tag,
  CreditCard,
  Printer,
  FileText,
  Search,
  CheckCircle,
} from 'lucide-react';
import BarcodeScanner from '../../components/BarcodeScanner';
import API from '../../utils/axios';
import { openProtectedFile } from '../../utils/download';
import confetti from 'canvas-confetti';

const SaleForm = () => {
  const queryClient = useQueryClient();

  // State
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Customer selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Inline Customer Creation
  const [newCustForm, setNewCustForm] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [showNewCustForm, setShowNewCustForm] = useState(false);

  // Success Modal
  const [completedSale, setCompletedSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cart operations
  const handleAddDevice = (device) => {
    if (cart.find((i) => i._id === device._id)) {
      alert('This device is already added to the billing cart.');
      return;
    }
    setCart([...cart, device]);
  };

  const handleRemoveDevice = (id) => {
    setCart(cart.filter((i) => i._id !== id));
  };

  // Autocomplete Customer lookup
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

  // Calculations
  const subTotal = cart.reduce((acc, curr) => acc + curr.sellingPrice, 0);
  // GST calculation (18% inclusive in the selling price)
  const gstAmount = Math.round(subTotal * 0.18);
  const discountVal = Math.round(subTotal * ((Number(discount) || 0) / 100));
  const finalTotal = Math.max(0, subTotal - discountVal);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your billing cart is empty.');
      return;
    }

    if (!selectedCustomer && !showNewCustForm) {
      alert('Please select an existing customer or register a new one.');
      return;
    }

    if (showNewCustForm && (!newCustForm.fullName || !newCustForm.phone)) {
      alert('Please fill out the customer name and phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        // Customer profile details
        customerId: selectedCustomer?._id,
        fullName: showNewCustForm ? newCustForm.fullName : undefined,
        phone: showNewCustForm ? newCustForm.phone : undefined,
        address: showNewCustForm ? newCustForm.address : undefined,
        
        // Cart
        items: cart.map((item) => ({
          item: item._id,
          price: item.sellingPrice,
        })),
        
        discount: discountVal,
        paymentMethod,
      };

      const res = await API.post('/sales', payload);
      setCompletedSale(res.data);
      
      // Clear local states
      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setNewCustForm({ fullName: '', phone: '', address: '' });
      setShowNewCustForm(false);
      queryClient.invalidateQueries(['inventory']);

      // Fire celebratory success confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to complete billing checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = (type = 'pdf') => {
    if (!completedSale) return;
    openProtectedFile(`/sales/${completedSale._id}/${type}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns: Scan & Cart details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Barcode scanner */}
        <BarcodeScanner onScanSuccess={handleAddDevice} />

        {/* Billing Cart */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary-500" />
              Billing Cart ({cart.length} Devices)
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Transaction Items</span>
          </div>

          {cart.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">
              No devices added yet. Scan a barcode above or search using the simulator button.
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.brand} {item.model}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Specs: {item.ram}GB/{item.storage}GB | IMEI: {item.imei1 || 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900 dark:text-white">₹{item.sellingPrice.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDevice(item._id)}
                      className="p-1 text-slate-450 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Customer info & Invoice Checkout */}
      <div className="space-y-6">
        {/* Customer Select Card */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-primary-500" />
            Customer (CRM Link)
          </h3>

          {!selectedCustomer && !showNewCustForm && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customer by name/phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                />
                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              </div>

              {/* Autocomplete Results */}
              {searchResults.length > 0 && (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {searchResults.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setSearchResults([]);
                        setCustomerSearch('');
                      }}
                      className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-800 dark:text-white">{c.fullName}</span>
                      <span className="text-[10px] text-slate-400">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="text-center py-2">
                <span className="text-[10px] text-slate-400">or</span>
              </div>

              <button
                type="button"
                onClick={() => setShowNewCustForm(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                Register New Customer
              </button>
            </div>
          )}

          {selectedCustomer && (
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-xs space-y-1 relative">
              <div className="font-bold text-slate-900 dark:text-white">{selectedCustomer.fullName}</div>
              <div className="text-slate-450">Phone: {selectedCustomer.phone}</div>
              {selectedCustomer.address && <div className="text-slate-450 text-[10px] line-clamp-1">Addr: {selectedCustomer.address}</div>}
              
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-2 right-2 text-xs text-rose-500 hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {showNewCustForm && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs relative">
              <h4 className="font-bold text-slate-800 dark:text-white">New Customer Quick Register</h4>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newCustForm.fullName}
                  onChange={(e) => setNewCustForm({ ...newCustForm, fullName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-205 rounded p-1.5 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number *"
                  value={newCustForm.phone}
                  onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-205 rounded p-1.5 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Residential Address"
                  value={newCustForm.address}
                  onChange={(e) => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-205 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewCustForm(false)}
                  className="text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing checkout details Card */}
        <div className="glass-panel p-6 rounded-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard size={18} className="text-primary-500" />
            Billing Summary
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₹{subTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span className="flex items-center gap-1">
                GST (18% inclusive):
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₹{gstAmount.toLocaleString()}</span>
            </div>

            {/* Discount field */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={discount || ''}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                    setDiscount(val);
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 pl-7 focus:outline-none font-bold"
                />
                <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">%</span>
              </div>
              {Number(discount) > 0 && (
                <div className="text-[10px] text-emerald-500 font-semibold mt-1">
                  Discount Value: -₹{discountVal.toLocaleString()}
                </div>
              )}
            </div>

            {/* Payment selection */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 focus:outline-none"
              >
                <option value="UPI">UPI (GooglePay/PhonePe)</option>
                <option value="Cash">Hard Cash</option>
                <option value="Card">Debit/Credit Card</option>
              </select>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
              <span>Final Total Paid:</span>
              <span className="text-xl font-black text-primary-500">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="text-rose-500 font-bold text-[10px] bg-rose-500/5 p-2 rounded border border-rose-500/15">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800/80 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? 'Completing Transaction...' : 'Complete & Generate Invoice'}
          </button>
        </div>
      </div>

      {/* Invoice success print modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-sm p-6 space-y-6 text-center shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 mb-3 border border-emerald-500/20">
                <CheckCircle size={28} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Invoice Generated Successfully!</h3>
              <p className="text-xs text-slate-450 mt-1">Invoice Number: {completedSale.invoiceNumber}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handlePrintPDF('pdf')}
                className="w-full bg-primary-650 hover:bg-primary-600 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow"
              >
                <FileText size={16} />
                Download A4 PDF Invoice
              </button>
              <button
                type="button"
                onClick={() => handlePrintPDF('thermal')}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors border border-slate-250/20"
              >
                <Printer size={16} />
                Print 80mm Thermal Receipt
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2 px-5 rounded-lg text-xs hover:opacity-90 transition-opacity"
              >
                Close & Start New Billing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleForm;
