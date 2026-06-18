import React, { useState, useRef, useEffect } from 'react';
import { Scan, Search, AlertCircle } from 'lucide-react';
import API from '../utils/axios';

const BarcodeScanner = ({ onScanSuccess }) => {
  const [scanInput, setScanInput] = useState('');
  const [showSim, setShowSim] = useState(false);
  const [availableStock, setAvailableStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Focus the input box automatically for physical barcode gun compatibility
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCode(scanInput);
    }
  };

  const submitCode = async (code) => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Search stock for match with IMEI 1, Serial, or code
      const res = await API.get(`/inventory?search=${code.trim()}&deviceStatus=Available`);
      if (res.data.items && res.data.items.length > 0) {
        // Find exact match or take first
        const matched = res.data.items.find(
          (i) => i.imei1 === code || i.serialNumber === code
        ) || res.data.items[0];
        
        onScanSuccess(matched);
        setScanInput('');
        setError('');
        setShowSim(false);
      } else {
        setError(`Device with IMEI/Serial "${code}" not found or is already sold.`);
      }
    } catch (err) {
      setError('Error scanning device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSimData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/inventory?deviceStatus=Available&limit=50');
      setAvailableStock(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSimulator = () => {
    setShowSim(true);
    loadSimData();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Scan className="text-primary-500" size={20} />
        <span className="text-sm font-bold text-slate-800 dark:text-white">Barcode & QR Scan Checkout</span>
      </div>

      {/* Scanned Input field */}
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Scan IMEI / Serial Number..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
        <button
          type="button"
          onClick={() => submitCode(scanInput)}
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={openSimulator}
          className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
        >
          <Scan size={16} />
          Simulate Camera
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-500/5 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-normal">
        * Tip: Keep cursor active in this input box to use a physical barcode reader gun.
      </p>

      {/* Simulator Modal */}
      {showSim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Camera Barcode Simulation</span>
              <button
                type="button"
                onClick={() => setShowSim(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-3 leading-normal">
                Click on any of the available stock items below to simulate a camera barcode scan action:
              </p>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400 skeleton-item">Loading stock database...</div>
              ) : availableStock.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No active available items in stock to scan</div>
              ) : (
                <div className="space-y-2">
                  {availableStock.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => submitCode(item.imei1 || item.serialNumber)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left transition-colors text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white">
                          {item.brand} {item.model}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          IMEI: {item.imei1 || 'N/A'} | S/N: {item.serialNumber || 'N/A'}
                        </div>
                      </div>
                      <span className="text-primary-500 font-bold">₹{item.sellingPrice.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
