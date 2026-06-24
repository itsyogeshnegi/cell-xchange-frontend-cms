import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Smartphone,
  Laptop,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import API from '../../utils/axios';

const Overview = () => {
  // 1. Fetch Summary Statistics
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await API.get('/analytics/summary');
      return res.data;
    },
    refetchInterval: 30000, // refresh every 30s
  });

  // 2. Fetch Chart Data
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: async () => {
      const res = await API.get('/analytics/charts');
      return res.data;
    },
  });

  if (summaryLoading || chartsLoading) {
    return (
      <div className="space-y-6 skeleton-item">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const { cards, recentSales } = summary || {};
  const { monthlyTrends, brandWiseStock } = charts || {};

  // Color variables
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const stats = [
    { title: 'Total Inventory', value: cards?.totalInventory, icon: Smartphone, color: 'text-primary-500 bg-primary-500/10' },
    { title: 'Today\'s Sales', value: `₹${cards?.todaySales.toLocaleString()}`, icon: ShoppingCart, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Monthly Revenue', value: `₹${cards?.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Monthly Net Profit', value: `₹${cards?.monthlyProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="glass-card p-6 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{stat.title}</span>
                <span className="text-2xl font-black text-slate-850 dark:text-white mt-1.5 block tracking-tight">
                  {stat.value !== undefined ? stat.value : '0'}
                </span>
              </div>
              <div className={`p-3 rounded-xl border border-slate-200/10 ${stat.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trends Area Chart */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Revenue Trend</h3>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Monthly sales performance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">Sales Revenue (₹)</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} formatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Area type="monotone" name="Sales Revenue" dataKey="Sales" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Stock Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Stock Brand Shares</h3>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={brandWiseStock}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {brandWiseStock?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Devices`]} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 max-h-12 overflow-y-auto">
              {brandWiseStock?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Stock Volume Bar Chart */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Stock Count by Brand</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandWiseStock} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="value" name="Devices in Stock" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {brandWiseStock?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Recent Transactions Tables */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Sales */}
        <div className="glass-panel p-6 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Shop Sales</h3>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Billing Queue</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Device Sold</th>
                  <th className="pb-3 text-right">Invoice Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentSales?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">No billing sales completed today</td>
                  </tr>
                ) : (
                  recentSales?.map((s) => {
                    const devDesc = s.items.map((i) => i.item ? `${i.item.brand} ${i.item.model}` : 'N/A').join(', ');
                    return (
                      <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">{s.invoiceNumber}</td>
                        <td className="py-3">{s.customer?.fullName}</td>
                        <td className="py-3 truncate max-w-[150px]" title={devDesc}>{devDesc}</td>
                        <td className="py-3 text-right font-bold text-primary-500">₹{s.totalAmount.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
