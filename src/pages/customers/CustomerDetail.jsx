import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import API from '../../utils/axios';

const CustomerDetail = () => {
  const { id } = useParams();
  
  // Preview modal states
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Fetch customer details & trade records
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customerDetail', id],
    queryFn: async () => {
      const res = await API.get(`/customers/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="py-24 text-center text-xs text-slate-450 skeleton-item">Loading customer record file...</div>;
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <AlertCircle className="text-rose-500" size={40} />
        <h3 className="font-bold text-slate-900 dark:text-white">Customer Record Not Found</h3>
        <p className="text-xs text-slate-500">The profile might have been deleted or moved.</p>
        <Link to="/admin/customers" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
          Back to Directory
        </Link>
      </div>
    );
  }

  const identityDocuments = [
    { label: 'Aadhaar Card Front', url: customer.aadhaarFront },
    { label: 'Aadhaar Card Back', url: customer.aadhaarBack },
    { label: 'PAN Card Image', url: customer.panImage },
  ].filter(doc => !!doc.url);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
        >
          <ArrowLeft size={14} />
          Back to Customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile card */}
        <div className="glass-panel p-6 rounded-xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <div 
              className={`w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-3xl text-slate-500 mb-4 shadow-inner transition-all duration-200 ${customer.customerPhoto ? 'cursor-pointer hover:ring-2 hover:ring-primary-500' : ''}`}
              onClick={() => {
                if (customer.customerPhoto) {
                  setPreviewImage(customer.customerPhoto);
                  setPreviewTitle(`${customer.fullName}'s Profile Photo`);
                }
              }}
            >
              {customer.customerPhoto ? (
                <img src={customer.customerPhoto} alt={customer.fullName} className="w-full h-full object-cover" />
              ) : (
                customer.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{customer.fullName}</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/5">
              {customer.gender}
            </span>
          </div>

          <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-3 text-slate-650 dark:text-slate-305">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <div>
                <div className="font-bold">Phone</div>
                <div>{customer.phone}</div>
                {customer.alternatePhone && <div className="text-[10px] text-slate-450 mt-0.5">Alt: {customer.alternatePhone}</div>}
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-650 dark:text-slate-305">
              <MapPin size={15} className="text-slate-400 shrink-0" />
              <div>
                <div className="font-bold">Address</div>
                <div className="leading-relaxed">{customer.address || 'Not Provided'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-650 dark:text-slate-305">
              <Calendar size={15} className="text-slate-400 shrink-0" />
              <div>
                <div className="font-bold">Register Date</div>
                <div>{new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-800 dark:text-white block mb-1">CRM Notes</span>
              <p className="text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right columns: Documentation & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Scans Grid */}
          <div className="glass-panel p-6 rounded-xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Identity Verification Documents</h4>
            {identityDocuments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/10 rounded-lg border border-slate-200/5">
                No identity document scans uploaded for this profile.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {identityDocuments.map((doc, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{doc.label}</span>
                      <div 
                        onClick={() => {
                          setPreviewImage(doc.url);
                          setPreviewTitle(doc.label);
                        }}
                        className="w-full h-28 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 mt-2 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary-500/50 transition-all group"
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
                      <FileText size={11} />
                      Preview Document
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trade History: Purchases & Sales */}
          <div className="glass-panel p-6 rounded-xl space-y-6">
            {/* Sales to Customer */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Billing Invoices (Sales to Customer)</span>
                <span className="text-[10px] text-slate-400">Total Purchase History</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Items Bought</th>
                      <th className="pb-2 text-right">Total Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {!customer.salesHistory || customer.salesHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">No invoices generated for this customer</td>
                      </tr>
                    ) : (
                      customer.salesHistory.map((s) => {
                        const itemsDesc = s.items?.map((i) => i.item ? `${i.item.brand} ${i.item.model}` : 'N/A').join(', ');
                        return (
                          <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{s.invoiceNumber}</td>
                            <td className="py-2.5">{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td className="py-2.5 truncate max-w-[200px]" title={itemsDesc}>{itemsDesc}</td>
                            <td className="py-2.5 text-right font-bold text-primary-500">₹{s.totalAmount.toLocaleString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purchases from Customer */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Trade-in Vouchers (Purchased from Customer)</span>
                <span className="text-[10px] text-slate-400">Total Inward History</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Voucher #</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Device Traded In</th>
                      <th className="pb-2 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {!customer.purchaseHistory || customer.purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">No trade-in purchases recorded for this customer</td>
                      </tr>
                    ) : (
                      customer.purchaseHistory.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{p.purchaseNumber}</td>
                          <td className="py-2.5">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-2.5 truncate max-w-[200px]">
                            {p.device ? `${p.device.brand} ${p.device.model} (${p.device.storage}GB)` : 'N/A'}
                          </td>
                          <td className="py-2.5 text-right font-bold text-emerald-500">₹{p.purchasePrice.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl relative"
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

export default CustomerDetail;
