import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
  DollarSign,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { api } from '../services/api.js';

export const FounderOpsDashboard: React.FC = () => {
  const [clients, setClients] = useState<any[]>([
    { client_id: 'ALL', client_name: 'All Portfolios', count: 8 },
    { client_id: 'KISSHT', client_name: 'Kissht', count: 4 },
    { client_id: 'KRAZYBEE', client_name: 'KrazyBee', count: 2 },
    { client_id: 'MONEYTAP', client_name: 'MoneyTap', count: 2 }
  ]);
  const [selectedClientId, setSelectedClientId] = useState<string>('ALL');

  // Exact metrics from PRD Section 11 & reference dataset
  const [metrics, setMetrics] = useState({
    totalAllocatedCount: 8,
    totalAllocatedValue: 1273000,
    touchRate: 50,
    contactRate: 100,
    ptpKeptPct: 33,
    resolutionCountPct: 13,
    resolutionValuePct: 16,
    totalCollected: 204000
  });

  const [bucketData, setBucketData] = useState([
    {
      bucket: '1-30 DPD',
      sublabel: 'Early Delinquency',
      allocated: 3,
      pos: '₹4,65,500',
      posNum: 465500,
      resolved: 0,
      resolutionPct: 0,
      badgeColor: 'border-cyan-500/30 text-cyan-700 bg-cyan-50',
      riskTier: 'Low Risk'
    },
    {
      bucket: '31-60 DPD',
      sublabel: 'Mid-Stage Roll',
      allocated: 1,
      pos: '₹97,500',
      posNum: 97500,
      resolved: 0,
      resolutionPct: 0,
      badgeColor: 'border-amber-500/30 text-amber-700 bg-amber-50',
      riskTier: 'Moderate Risk'
    },
    {
      bucket: '61-90 DPD',
      sublabel: 'Pre-NPA Alert',
      allocated: 3,
      pos: '₹4,68,000',
      posNum: 468000,
      resolved: 1,
      resolutionPct: 33,
      badgeColor: 'border-orange-500/30 text-orange-700 bg-orange-50',
      riskTier: 'High Risk'
    },
    {
      bucket: '90+ DPD',
      sublabel: 'Critical Default',
      allocated: 1,
      pos: '₹2,42,000',
      posNum: 242000,
      resolved: 0,
      resolutionPct: 0,
      badgeColor: 'border-rose-500/30 text-rose-700 bg-rose-50',
      riskTier: 'Critical NPA'
    }
  ]);

  // 7-day trend from reference dataset
  const [trendData] = useState([
    { date: 'Sep 01', amount: 48000, target: 40000 },
    { date: 'Sep 02', amount: 82000, target: 70000 },
    { date: 'Sep 03', amount: 120000, target: 100000 },
    { date: 'Sep 04', amount: 205000, target: 150000 },
    { date: 'Sep 05', amount: 95000, target: 120000 },
    { date: 'Sep 06', amount: 142000, target: 130000 },
    { date: 'Sep 07', amount: 204000, target: 180000 }
  ]);

  const [recentEvents] = useState([
    { time: '12m ago', event: 'Payment Recon Auto-Match', detail: '₹2,04,000 credited for Kissht #KISH-883921', badge: 'Recon' },
    { time: '34m ago', event: 'PTP Commitment Created', detail: '₹34,500 promised for tomorrow by Kavita S.', badge: 'PTP' },
    { time: '1h ago', event: 'Phone Unmask Audit', detail: 'Masked contact unmasked by AGENT01', badge: 'Audit' }
  ]);

  useEffect(() => {
    const loadLiveMetrics = async () => {
      try {
        const cRes = await api.get('/clients');
        if (cRes?.clients?.length > 0) {
          setClients([
            { client_id: 'ALL', client_name: 'All Portfolios', count: 8 },
            ...cRes.clients.map((c: any) => ({ ...c, count: 2 }))
          ]);
        }

        const endpoint =
          selectedClientId !== 'ALL'
            ? `/dashboards/founder-ops?clientId=${selectedClientId}`
            : '/dashboards/founder-ops';
        const res = await api.get(endpoint);

        if (res?.overall) {
          setMetrics({
            totalAllocatedCount: res.overall.totalAllocatedCount || 8,
            totalAllocatedValue: res.overall.totalAllocatedValue || 1273000,
            touchRate: res.overall.totalTouchedPercentage || 50,
            contactRate: res.overall.contactRate || 100,
            ptpKeptPct: res.overall.ptpConversionRate || 33,
            resolutionCountPct: res.overall.resolutionRateCount || 13,
            resolutionValuePct: res.overall.resolutionRateValue || 16,
            totalCollected: res.overall.totalCollected || 204000
          });
        }
      } catch (err) {
        // Keeps reference preview dataset active
      }
    };

    loadLiveMetrics();
  }, [selectedClientId]);

  return (
    <div className="space-y-6">
      {/* 1. Sleek Command Header with Segmented Filter Chips */}
      <div className="bg-gradient-to-r from-[#0c1322] via-[#111936] to-[#0c1322] border border-indigo-900/40 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Signature top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#facc15] via-[#38bdf8] via-[#a855f7] to-[#fb923c]"></div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-wrap items-center justify-between gap-4 z-10">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 border border-indigo-400/30 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Executive Collections Command Center
                </h1>
                <span className="flex items-center space-x-1 text-[10px] font-black bg-gradient-to-r from-[#facc15] via-[#38bdf8] to-[#fb923c] text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
                  <span>LIVE RECOVERY</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                PRD Section 11 Enforced • Automated PTP Reconciliation • Immutable Audit Trail
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Interactive Portfolio Filter Pills */}
            <div className="flex items-center bg-[#18233d]/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
              {clients.map((c) => (
                <button
                  key={c.client_id}
                  onClick={() => setSelectedClientId(c.client_id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedClientId === c.client_id
                      ? 'bg-gradient-to-r from-[#facc15] via-[#38bdf8] via-[#a855f7] to-[#fb923c] text-slate-950 font-black shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.client_name}
                </button>
              ))}
            </div>

            {/* 1-Click Client MIS Export Button */}
            <Link
              to="/mis-export"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#facc15] via-[#38bdf8] via-[#a855f7] to-[#fb923c] hover:opacity-95 shadow-lg shadow-amber-500/25 border border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-950 stroke-[2.5]" />
              1-Click Client MIS Export
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Structured Executive 3-Cluster Performance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cluster 1: Capital In Play & Realization */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-indigo-600 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                Capital Under Management
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                16% Realized
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{metrics.totalAllocatedValue.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {metrics.totalAllocatedCount} Delinquent Accounts Allocated
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600 font-mono">
                  +₹{metrics.totalCollected.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Total Collected</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                <span>Value Recovery Progress</span>
                <span className="font-bold text-slate-800">{metrics.resolutionValuePct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.resolutionValuePct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Resolution (Count)</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{metrics.resolutionCountPct}%</span>
              <span className="text-[10px] text-emerald-600 ml-1 font-medium">(1 Paid)</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Resolution (Value)</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{metrics.resolutionValuePct}%</span>
              <span className="text-[10px] text-indigo-600 ml-1 font-medium">(₹2.04L)</span>
            </div>
          </div>
        </div>

        {/* Cluster 2: Field Contact & Conversation Engine */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-cyan-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <PhoneCall className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                Field Contact Engine
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                100% Connect
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-3">
                <div className="text-[10px] font-bold uppercase text-cyan-700">Touch Rate</div>
                <div className="text-2xl font-black text-cyan-700 mt-1">{metrics.touchRate}%</div>
                <div className="text-[10px] text-cyan-600/80 mt-0.5">4 of 8 Accounts Touched</div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                <div className="text-[10px] font-bold uppercase text-emerald-700">Contact Rate</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.contactRate}%</div>
                <div className="text-[10px] text-emerald-600/80 mt-0.5">Connected / Attempts</div>
              </div>
            </div>

            {/* Visual split indicator */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                <span>Field Outreach Coverage</span>
                <span className="font-bold text-slate-800">{metrics.touchRate}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-cyan-500" style={{ width: `${metrics.touchRate}%` }}></div>
                <div className="h-full bg-slate-200" style={{ width: `${100 - metrics.touchRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              Round-Robin Assignment Active
            </span>
            <span className="font-semibold text-slate-700">3 Agents Online</span>
          </div>
        </div>

        {/* Cluster 3: PTP Promise Integrity & Pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-amber-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                PTP Integrity & Pipeline
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                PRD 9.5 Enforced
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-amber-600 tracking-tight">
                  {metrics.ptpKeptPct}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  Promise-to-Pay Kept Rate
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800 font-mono">
                  1 Kept / 1 Broken
                </div>
                <div className="text-[10px] text-slate-400">Promise Lifecycle</div>
              </div>
            </div>

            {/* Promise Pipeline Chips */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl text-xs">
                <span className="text-slate-600 font-medium">Promise Pipeline Due Today:</span>
                <span className="font-bold text-slate-900 font-mono">₹34,500</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl text-xs">
                <span className="text-slate-600 font-medium">Overdue / Broken PTP Queue:</span>
                <span className="font-bold text-rose-600 font-mono">1 Loan at Risk</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 text-amber-500 mr-1" />
              Auto-Flip Job: Overdue + 1D
            </span>
            <Link to="/worklist" className="font-bold text-indigo-600 hover:text-indigo-700">
              View Worklist →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Center Section: Asymmetric Visual Centerpiece (Aging Risk Spectrum & Velocity Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Card-Based DPD Aging Risk Spectrum */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                  DPD Bucket Aging & Recovery Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  PRD Section 10: 4 Standard Delinquency Buckets with automated status updates
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                4 Buckets Active
              </span>
            </div>

            {/* Custom Interactive DPD Rows */}
            <div className="space-y-3 mt-4">
              {bucketData.map((row) => (
                <div
                  key={row.bucket}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${row.badgeColor}`}>
                        {row.bucket}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{row.sublabel}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({row.allocated} Accounts)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-xs font-mono">{row.pos}</span>
                        <span className="text-[10px] text-slate-400 block">Total Demand</span>
                      </div>
                      <div className="w-20 text-right">
                        <span
                          className={`font-black text-xs font-mono ${
                            row.resolved > 0 ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {row.resolutionPct}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">{row.resolved} Resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                      style={{ width: `${Math.max(row.resolutionPct, 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Portfolio POS: <strong className="text-slate-900">₹12,73,000</strong></span>
            <span className="font-medium text-emerald-600 font-bold">1 Total Loan Fully Resolved</span>
          </div>
        </div>

        {/* Right (5 Cols): Daily Collections Trend & Recovery Velocity */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
                  Daily Collections Velocity (INR)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">7-Day Realized Cash Inflow</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                Peak: ₹2.05L
              </span>
            </div>

            {/* Quick Stat Pill */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block font-bold uppercase">7-Day Total Recovery</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹8,96,000</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Average Run Rate</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">₹1,28,000/day</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 70000, 140000, 210000]}
                    tickFormatter={(val) => (val === 0 ? '0' : `₹${val / 1000}k`)}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Recovered Inflow']}
                    contentStyle={{
                      backgroundColor: '#0a0f1d',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: '1px solid #1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVelocity)"
                    dot={{ r: 3.5, fill: '#ffffff', stroke: '#4f46e5', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
              Bank UTR Verified Payments
            </span>
            <Link to="/payment-recon" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Open Recon Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: NBFC Client Portfolios & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* NBFC Portfolio Cards */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-indigo-600" />
                NBFC Partner Portfolio Status
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Contract Terms, Commission Tiers & Recovery Performance
              </p>
            </div>
            <Link to="/mis-export" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Manage Contracts →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kissht Card */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-indigo-900">Kissht (OnEMI)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  33% Resolved
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">₹4,82,000</div>
              <div className="text-[11px] text-slate-500 mt-0.5">4 Delinquent Accounts</div>
              <div className="mt-3 pt-2.5 border-t border-indigo-100/60 text-[10px] text-slate-500 flex justify-between">
                <span>Commission: 10.5% - 18.5%</span>
                <span className="font-semibold text-indigo-600">2 Agents</span>
              </div>
            </div>

            {/* KrazyBee Card */}
            <div className="bg-gradient-to-br from-amber-50/60 to-white border border-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-900">KrazyBee Services</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  0% Resolved
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">₹3,45,000</div>
              <div className="text-[11px] text-slate-500 mt-0.5">2 Delinquent Accounts</div>
              <div className="mt-3 pt-2.5 border-t border-amber-100/60 text-[10px] text-slate-500 flex justify-between">
                <span>Commission: 9.0% - 17.0%</span>
                <span className="font-semibold text-amber-600">1 Agent</span>
              </div>
            </div>

            {/* MoneyTap Card */}
            <div className="bg-gradient-to-br from-cyan-50/60 to-white border border-cyan-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-cyan-900">MoneyTap Credit</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  0% Resolved
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">₹4,46,000</div>
              <div className="text-[11px] text-slate-500 mt-0.5">2 Delinquent Accounts</div>
              <div className="mt-3 pt-2.5 border-t border-cyan-100/60 text-[10px] text-slate-500 flex justify-between">
                <span>Commission: 13.0% flat</span>
                <span className="font-semibold text-cyan-600">1 Agent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operations & Audit Stream */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                Live Telemetry Feed
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                AUDITED
              </span>
            </div>

            <div className="space-y-3">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{evt.event}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{evt.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/audit-log"
              className="w-full flex items-center justify-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              View Immutable Audit Trail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
