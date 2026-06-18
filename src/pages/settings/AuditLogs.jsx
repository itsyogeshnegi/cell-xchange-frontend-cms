import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Terminal, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import API from '../../utils/axios';

const AuditLogs = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [page, setPage] = useState(1);

  // Fetch audit logs
  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: async () => {
      const res = await API.get('/audit-logs', { params: { page, limit: 12 } });
      return res.data;
    },
    enabled: isAdmin, // only run if admin
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="text-rose-500 animate-pulse" size={48} />
        <h3 className="font-bold text-slate-850 dark:text-white text-base">Security Access Denied</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          The operation audit log directory contains restricted system access data and requires administrative level clearance.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">Fetching operation audit logs directory...</div>;
  }

  const logs = data?.logs || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Terminal size={20} className="text-primary-500" />
            System Operation Audit Logs
          </h2>
          <p className="text-xs text-slate-500">Track all logins, invoice creations, and stock updates in realtime.</p>
        </div>
        <div className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-200/10 flex items-center gap-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          Tamper-Proof Ledger Active
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No system activity logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-3">Operator</th>
                  <th className="py-4 px-3">Role</th>
                  <th className="py-4 px-3">Action Event</th>
                  <th className="py-4 px-3">Details</th>
                  <th className="py-4 px-6 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-mono text-[11px] text-slate-700 dark:text-slate-350">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-805/10 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-6 text-slate-450 flex items-center gap-1.5 font-sans">
                      <Clock size={11} className="text-slate-400" />
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    {/* Operator email */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-sans">
                      {log.user?.email || 'System / Guest'}
                    </td>
                    {/* Role */}
                    <td className="py-3 px-3 font-sans capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.user?.role === 'super_admin'
                          ? 'bg-purple-100 dark:bg-purple-950/20 text-purple-500'
                          : log.user?.role === 'admin'
                          ? 'bg-rose-100 dark:bg-rose-950/20 text-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {log.user?.role || 'guest'}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-205 font-sans">
                      {log.action}
                    </td>
                    {/* Details */}
                    <td className="py-3 px-3 font-sans text-xs max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    {/* IP */}
                    <td className="py-3 px-6 text-right text-slate-450">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center text-xs">
            <span className="text-slate-450 font-medium font-sans">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-slate-650 disabled:opacity-40 transition-colors font-sans"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-slate-650 disabled:opacity-40 transition-colors font-sans"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
