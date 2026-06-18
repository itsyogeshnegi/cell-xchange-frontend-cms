import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Calendar,
  FileDown,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Boxes,
  TrendingDown,
} from 'lucide-react';
import API from '../../utils/axios';
import { openProtectedFile } from '../../utils/download';

const ReportsPage = () => {
  // Filters
  const [reportType, setReportType] = useState('sales');
  const [range, setRange] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Fetch Report Data
  const { data, isLoading } = useQuery({
    queryKey: ['reportData', reportType, range, startDate, endDate],
    queryFn: async () => {
      const res = await API.get('/reports', {
        params: {
          reportType,
          range,
          startDate: range === 'custom' ? startDate : undefined,
          endDate: range === 'custom' ? endDate : undefined,
        },
      });
      return res.data;
    },
  });

  const summary = data?.summary || {};
  const rows = data?.rows || [];

  // Export spreadsheet helper
  const handleExportExcel = () => {
    const params = {
      reportType,
      range,
    };
    if (range === 'custom') {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }
    openProtectedFile('/reports/export', params);
  };

  return (
    <div className="space-y-6">
      {/* Filters block */}
      <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full md:flex-1">
          {/* Report Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Module</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="sales">Sales & Revenue</option>
              <option value="purchases">Trade-in Purchases</option>
              <option value="profit">Net Profit Margins</option>
              <option value="inventory">Inventory Stock Valuation</option>
            </select>
          </div>

          {/* Time range */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Duration</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="daily">Today (Daily)</option>
              <option value="weekly">This Week (Weekly)</option>
              <option value="monthly">This Month (Monthly)</option>
              <option value="yearly">This Year (Yearly)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {range === 'custom' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-205 p-1.5 rounded text-xs dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-205 p-1.5 rounded text-xs dark:text-white"
                />
              </div>
            </>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={handleExportExcel}
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-primary-950/20"
        >
          <FileDown size={14} />
          Download Excel Spreadsheet
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">
          Compiling business spreadsheet reports...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Summary */}
            {reportType === 'sales' && (
              <>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Total Gross Revenue</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 block">
                      ₹{summary.totalSales?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Total Discounts Handed</span>
                    <span className="text-2xl font-black text-rose-500 mt-1.5 block">
                      ₹{summary.totalDiscount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                    <TrendingDown size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Transaction Counts</span>
                    <span className="text-2xl font-black text-emerald-500 mt-1.5 block">
                      {summary.transactionCount || 0} Sales
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <ShoppingCart size={20} />
                  </div>
                </div>
              </>
            )}

            {/* Purchase Summary */}
            {reportType === 'purchases' && (
              <>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Total Inward Outlay</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 block">
                      ₹{summary.totalSpent?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Average Device Inward Price</span>
                    <span className="text-2xl font-black text-emerald-500 mt-1.5 block">
                      ₹{summary.averagePurchasePrice?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <ShoppingCart size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Trade-in Volume</span>
                    <span className="text-2xl font-black text-amber-500 mt-1.5 block">
                      {summary.purchaseCount || 0} Inwarded
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Boxes size={20} />
                  </div>
                </div>
              </>
            )}

            {/* Profit Summary */}
            {reportType === 'profit' && (
              <>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Gross Revenue</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 block">
                      ₹{summary.totalRevenue?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Cost of Goods Sold (COGS)</span>
                    <span className="text-2xl font-black text-rose-500 mt-1.5 block">
                      ₹{summary.totalCostOfGoods?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                    <TrendingDown size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Net Profit Margin ({summary.profitMarginPercent || 0}%)</span>
                    <span className="text-2xl font-black text-emerald-500 mt-1.5 block">
                      ₹{summary.totalNetProfit?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </>
            )}

            {/* Inventory Valuation Summary */}
            {reportType === 'inventory' && (
              <>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Total Active Items in Stock</span>
                    <span className="text-2xl font-black text-slate-905 dark:text-white mt-1.5 block">
                      {summary.totalItemsCount || 0} Devices
                    </span>
                  </div>
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                    <Boxes size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Stock Valuation (Inward Cost)</span>
                    <span className="text-2xl font-black text-emerald-500 mt-1.5 block">
                      ₹{summary.stockValuation?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Estimated Profit on Sale</span>
                    <span className="text-2xl font-black text-amber-500 mt-1.5 block">
                      ₹{summary.estimatedProfit?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rows table */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {reportType === 'sales' && (
                      <>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-3">Invoice #</th>
                        <th className="py-4 px-3">Customer details</th>
                        <th className="py-4 px-3">Devices Billing</th>
                        <th className="py-4 px-3 text-right">Subtotal</th>
                        <th className="py-4 px-3 text-right">Tax (GST)</th>
                        <th className="py-4 px-6 text-right">Invoice Total</th>
                      </>
                    )}
                    {reportType === 'purchases' && (
                      <>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-3">Voucher #</th>
                        <th className="py-4 px-3">Seller Name</th>
                        <th className="py-4 px-3">Device specifications</th>
                        <th className="py-4 px-3 font-mono">IMEI / Serial</th>
                        <th className="py-4 px-3">Payment Mode</th>
                        <th className="py-4 px-6 text-right">Amount Paid</th>
                      </>
                    )}
                    {reportType === 'profit' && (
                      <>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-3">Invoice #</th>
                        <th className="py-4 px-3">Customer</th>
                        <th className="py-4 px-3 text-right">Sales Revenue</th>
                        <th className="py-4 px-3 text-right">Cost of Goods (COGS)</th>
                        <th className="py-4 px-3 text-right">Net Profit</th>
                        <th className="py-4 px-6 text-right">Profit Margin</th>
                      </>
                    )}
                    {reportType === 'inventory' && (
                      <>
                        <th className="py-4 px-6">Date Added</th>
                        <th className="py-4 px-3">Brand & Model</th>
                        <th className="py-4 px-3">Category</th>
                        <th className="py-4 px-3">IMEI/Serial</th>
                        <th className="py-4 px-3">Status</th>
                        <th className="py-4 px-3 text-right">Buy-in Cost</th>
                        <th className="py-4 px-6 text-right">Selling Price</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-700 dark:text-slate-350">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">No transactions recorded in this period range</td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                        {reportType === 'sales' && (
                          <>
                            <td className="py-3 px-6">{row.date}</td>
                            <td className="py-3 px-3 font-semibold">{row.invoiceNo}</td>
                            <td className="py-3 px-3">{row.customerName}</td>
                            <td className="py-3 px-3 truncate max-w-[150px]" title={row.devices}>{row.devices}</td>
                            <td className="py-3 px-3 text-right">₹{row.subTotal?.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-slate-400">₹{row.gstAmount?.toLocaleString()}</td>
                            <td className="py-3 px-6 text-right font-bold text-primary-500">₹{row.total?.toLocaleString()}</td>
                          </>
                        )}
                        {reportType === 'purchases' && (
                          <>
                            <td className="py-3 px-6">{row.date}</td>
                            <td className="py-3 px-3 font-semibold">{row.voucherNo}</td>
                            <td className="py-3 px-3">{row.customerName}</td>
                            <td className="py-3 px-3">{row.device}</td>
                            <td className="py-3 px-3 font-mono">{row.imei}</td>
                            <td className="py-3 px-3 capitalize">{row.paymentMethod}</td>
                            <td className="py-3 px-6 text-right font-bold text-emerald-500">₹{row.purchasePrice?.toLocaleString()}</td>
                          </>
                        )}
                        {reportType === 'profit' && (
                          <>
                            <td className="py-3 px-6">{row.date}</td>
                            <td className="py-3 px-3 font-semibold">{row.invoiceNo}</td>
                            <td className="py-3 px-3">{row.customer}</td>
                            <td className="py-3 px-3 text-right">₹{row.revenue?.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-rose-500">₹{row.costOfGoods?.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-500">₹{row.netProfit?.toLocaleString()}</td>
                            <td className="py-3 px-6 text-right font-semibold text-slate-450">{row.marginPercent}%</td>
                          </>
                        )}
                        {reportType === 'inventory' && (
                          <>
                            <td className="py-3 px-6">{row.dateAdded}</td>
                            <td className="py-3 px-3 font-semibold">{row.brand} {row.model}</td>
                            <td className="py-3 px-3 capitalize">{row.type}</td>
                            <td className="py-3 px-3 font-mono">{row.imei}</td>
                            <td className="py-3 px-3 capitalize">{row.status}</td>
                            <td className="py-3 px-3 text-right">₹{row.purchasePrice?.toLocaleString()}</td>
                            <td className="py-3 px-6 text-right font-bold text-slate-900 dark:text-white">₹{row.sellingPrice?.toLocaleString()}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
