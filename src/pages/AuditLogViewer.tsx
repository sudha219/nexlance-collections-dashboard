import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Lock,
  Calendar,
  User,
  CheckCircle2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { api } from '../services/api.js';
import { AuditLogItem } from '../types/index.js';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const endpoint = actionFilter
        ? `/audit?actionType=${actionFilter}&limit=100`
        : '/audit?limit=100';
      const res = await api.get(endpoint);
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PHONE_REVEAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            👁️ Phone Reveal
          </span>
        );
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            🔐 Auth
          </span>
        );
      case 'USER_DISABLED':
      case 'SESSIONS_TERMINATED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            🛑 Security Terminate
          </span>
        );
      case 'REASSIGNMENT':
      case 'ASSIGNMENT_ROUND_ROBIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            🔄 Allocation Reassign
          </span>
        );
      case 'DISPOSITION_SUBMIT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            📝 Disposition
          </span>
        );
      case 'PAYMENT_FILE_INGEST':
      case 'PAYMENT_EXCEPTION_RESOLVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
            💰 Payment Recon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Immutable Audit Trail Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">
            PRD Section 12.7: Strictly Immutable Log • Evidentiary Trail for Client Audits • Read-Only for All Roles
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Audit Actions</option>
              <option value="PHONE_REVEAL">Phone Number Reveals (PRD 12.2)</option>
              <option value="DISPOSITION_SUBMIT">Dispositions Captured</option>
              <option value="REASSIGNMENT">Account Reassignments</option>
              <option value="USER_DISABLED">User Deactivations</option>
              <option value="PAYMENT_FILE_INGEST">Payment Ingestions</option>
              <option value="LOGIN_SUCCESS">Successful Logins</option>
              <option value="LOGIN_FAILED">Failed Login Attempts</option>
            </select>
          </div>

          <button
            onClick={loadLogs}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100">PostgreSQL Immutable Table Policy Enforced</div>
            <div className="text-xs text-slate-400">
              Trigger <code className="text-emerald-400 font-mono">trg_audit_log_no_update_or_delete</code> aborts any UPDATE/DELETE commands.
            </div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs font-mono text-slate-400">{logs.length} events logged</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading immutable audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No audit records matching filter.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3.5">Timestamp (UTC/IST)</th>
                  <th className="px-4 py-3.5">Action Type</th>
                  <th className="px-4 py-3.5">Actor (Human)</th>
                  <th className="px-4 py-3.5">Target Entity</th>
                  <th className="px-4 py-3.5 font-mono">Entity ID</th>
                  <th className="px-4 py-3.5 font-mono">IP Address</th>
                  <th className="px-6 py-3.5 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">{getActionBadge(log.action_type)}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{log.actor_name || 'System / Admin'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actor_code || log.user_id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-mono">{log.entity}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono">{log.entity_id.slice(0, 16)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">{log.ip_address}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payload Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Audit Record Detail</h3>
                <span className="text-xs font-mono text-slate-400">{selectedLog.log_id}</span>
              </div>
              {getActionBadge(selectedLog.action_type)}
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Actor</span>
                  <span className="font-bold text-slate-800">{selectedLog.actor_name} ({selectedLog.actor_code})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Action Type</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedLog.action_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
                  <span className="text-slate-700 font-mono">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">IP Address</span>
                  <span className="text-slate-700 font-mono">{selectedLog.ip_address}</span>
                </div>
              </div>

              {selectedLog.old_value && (
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Previous State (Old Value):</div>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto text-[11px] font-mono">
                    {JSON.stringify(selectedLog.old_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_value && (
                <div>
                  <div className="font-semibold text-slate-700 mb-1">New State (Recorded Delta):</div>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl overflow-x-auto text-[11px] font-mono">
                    {JSON.stringify(selectedLog.new_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
