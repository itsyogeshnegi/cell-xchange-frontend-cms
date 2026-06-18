import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, Smartphone, Sparkles, CheckCircle } from 'lucide-react';
import API from '../../utils/axios';

const AnalyticsPage = () => {
  // Fetch detailed analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analyticsCharts'],
    queryFn: async () => {
      const res = await API.get('/analytics/charts');
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">Loading advanced analytics charts...</div>;
  }

  const { monthlyTrends, brandWiseStock, statusDistribution, categoryValuation } = analytics || {};

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Overview stats header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Analytics & Business Insights</h2>
          <p className="text-xs text-slate-500">Examine brand shares, revenue streams, and stock distribution.</p>
        </div>
        <div className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-200/5 flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary-500" />
          Realtime Aggregations Active
        </div>
      </div>

      {/* Monthly Finance trends Area Chart */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gross Cash Flow Volumes (Monthly)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.1} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} formatter={(val) => `₹${val.toLocaleString()}`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" name="Billing Sales (Revenue)" dataKey="Sales" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" name="Trade-ins Paid (Outlay)" dataKey="Purchases" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Brand Stocks & Status distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Stock Volume Bar Chart */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Stock Count by Brand</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandWiseStock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="value" name="Devices in Stock" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {brandWiseStock?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Status Distribution</h3>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} Items`]} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center">
              {statusDistribution?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-semibold">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
