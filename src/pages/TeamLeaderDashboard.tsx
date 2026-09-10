import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Flame,
  Clock,
  IndianRupee,
  RefreshCw,
  CheckCircle,
  PhoneCall,
  ArrowRightLeft
} from 'lucide-react';
import { api } from '../services/api.js';
import { TeamLeaderData } from '../types/index.js';

export const TeamLeaderDashboard: React.FC = () => {
  const [data, setData] = useState<TeamLeaderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Reassignment Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [allocationId, setAllocationId] = useState('');
  const [targetAgentId, setTargetAgentId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignMsg, setReassignMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboards/team-leader');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    setReassignMsg(null);
    try {
      await api.post('/allocations/reassign', {
        allocationId,
        newAgentId: targetAgentId,
        reason: reassignReason
      });
      setReassignMsg('Allocation reassigned and written to immutable audit log!');
      setAllocationId('');
      setReassignReason('');
      fetchData();
    } catch (err: any) {
      setReassignMsg(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading team operations data...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-400">No team data available.</div>;
  }

  const { teamTotals, agentMetrics } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Leader Operations Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time agent productivity, zero-activity tracking, and team load balancing
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReassignModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 mr-1.5" />
            Reassign Account
          </button>
          <button
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PRD Section 10: Team Totals Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Assigned Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{teamTotals.accountsAssigned}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Touched Today</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{teamTotals.touchedToday}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Connected Calls</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{teamTotals.connectedToday}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">PTPs Taken</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{teamTotals.ptpTakenToday}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Team Collections</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            ₹{teamTotals.collectionsThisMonth.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg PTP Kept %</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{teamTotals.avgPtpKeptPercentage}%</div>
        </div>
      </div>

      {/* Zero Activity Alert Banner (if any) */}
      {teamTotals.zeroActivityAgentsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-rose-900 text-sm">
                Attention: {teamTotals.zeroActivityAgentsCount} Agent(s) with Zero Activity Today!
              </div>
              <div className="text-xs text-rose-700 mt-0.5">
                Per PRD Section 10: Agents with zero interactions are flagged in red. Check for login issues or bottlenecks.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRD Section 10: Agent Productivity Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Team Roster & Productivity Matrix</h3>
          <span className="text-xs text-slate-400">Comparing Effort vs Recovery</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Agent Name</th>
                <th className="px-4 py-3.5 text-center">Status Today</th>
                <th className="px-4 py-3.5 text-right">Assigned</th>
                <th className="px-4 py-3.5 text-right">Touched</th>
                <th className="px-4 py-3.5 text-right">Connected</th>
                <th className="px-4 py-3.5 text-right">PTP Taken</th>
                <th className="px-4 py-3.5 text-right">PTP Due</th>
                <th className="px-4 py-3.5 text-right">PTP Kept %</th>
                <th className="px-6 py-3.5 text-right">Collections (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {agentMetrics.map((a) => (
                <tr
                  key={a.agentId}
                  className={`transition-colors ${
                    a.zeroActivityToday ? 'bg-rose-50/50 hover:bg-rose-100/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                      {a.name.charAt(0)}
                    </span>
                    <span>{a.name}</span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    {a.zeroActivityToday ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Zero Activity
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active Today
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right font-mono text-slate-700">{a.accountsAssigned}</td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">{a.touchedToday}</td>
                  <td className="px-4 py-4 text-right font-mono text-emerald-700">{a.connectedToday}</td>
                  <td className="px-4 py-4 text-right font-mono text-amber-700">{a.ptpTakenToday}</td>
                  <td className="px-4 py-4 text-right font-mono text-rose-700">{a.ptpDueToday}</td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">{a.ptpKeptPercentage}%</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-700">
                    ₹{a.collectionsCreditedThisMonth.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassignment Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reassign Account within Team</h3>
            <p className="text-xs text-slate-500 mb-4">
              PRD Section 9.2: Team Leader can reassign accounts. Every reassignment is written to the immutable audit log.
            </p>

            {reassignMsg && (
              <div className="mb-4 p-3 rounded-xl bg-slate-100 text-xs text-slate-800 font-medium">
                {reassignMsg}
              </div>
            )}

            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  Allocation ID or Loan ID
                </label>
                <input
                  type="text"
                  required
                  value={allocationId}
                  onChange={(e) => setAllocationId(e.target.value)}
                  placeholder="alloc_001 or KIS-..."
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  Assign To Agent
                </label>
                <select
                  required
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">Select team member...</option>
                  {agentMetrics.map((a) => (
                    <option key={a.agentId} value={a.agentId}>
                      {a.name} ({a.accountsAssigned} accounts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  Reason for Reassignment
                </label>
                <input
                  type="text"
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Agent leave, language mismatch, skill alignment"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
