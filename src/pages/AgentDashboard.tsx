import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  PhoneCall,
  Calendar,
  IndianRupee,
  Percent,
  Flame,
  Clock
} from 'lucide-react';
import { api } from '../services/api.js';
import { AgentMetrics } from '../types/index.js';

export const AgentDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboards/agent');
        setMetrics(res.metrics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading your agent scorecard...</div>;
  }

  if (!metrics) {
    return <div className="p-8 text-center text-slate-400">No scorecard data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Performance Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Daily Effort & Recovery Metrics for <span className="font-bold text-slate-700">{metrics.name}</span>
        </p>
      </div>

      {/* PRD Section 10: 7 Key Agent Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Accounts Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accounts Assigned</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.accountsAssigned}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total portfolio under your stewardship</div>
        </div>

        {/* Touched Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Touched Today</span>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.touchedToday}</div>
          <div className="text-[11px] text-slate-400 mt-1">Distinct accounts dialed today</div>
        </div>

        {/* Connected Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Connected Today</span>
            <PhoneCall className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.connectedToday}</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct borrower contacts made</div>
        </div>

        {/* PTP Taken Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">PTP Taken Today</span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{metrics.ptpTakenToday}</div>
          <div className="text-[11px] text-slate-400 mt-1">Payment commitments secured</div>
        </div>

        {/* PTP Due Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">PTP Due Today</span>
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{metrics.ptpDueToday}</div>
          <div className="text-[11px] text-slate-400 mt-1">Maturity promises scheduled today</div>
        </div>

        {/* Collections Credited This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collections Credited</span>
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono mt-2">
            ₹{metrics.collectionsCreditedThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Reconciled recovery this month</div>
        </div>

        {/* My PTP Kept Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">PTP Kept Conversion</span>
            <Percent className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-3xl font-black text-slate-900">{metrics.ptpKeptPercentage}%</span>
            <span className="text-xs font-medium text-slate-500">of matured promises paid</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full"
              style={{ width: `${Math.min(metrics.ptpKeptPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
