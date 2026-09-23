import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  History,
  ShieldCheck,
  Building,
  DollarSign,
  Tag,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';
import { Allocation, ActivityLogItem, PtpRecord } from '../types/index.js';

export const AgentWorklist: React.FC = () => {
  const [queue, setQueue] = useState<Allocation[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [history, setHistory] = useState<ActivityLogItem[]>([]);
  const [ptps, setPtps] = useState<PtpRecord[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(false);

  // Phone Reveal State
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealingPhone, setRevealingPhone] = useState(false);
  const [phoneAuditLogged, setPhoneAuditLogged] = useState(false);

  // Disposition Form State
  const [contactMode, setContactMode] = useState('Phone');
  const [dispositionCategory, setDispositionCategory] = useState<'Contactable' | 'Non Contactable' | 'Other'>('Contactable');
  const [dispositionCode, setDispositionCode] = useState('PTP Taken');
  const [subDisposition, setSubDisposition] = useState('');
  const [remarks, setRemarks] = useState('');
  const [nextActionDate, setNextActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [promisedAmount, setPromisedAmount] = useState<string>('');
  const [promisedDate, setPromisedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [submittingDisp, setSubmittingDisp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const contactableOptions = [
    'PTP Taken',
    'Already Paid',
    'Partial Payment Promised',
    'Dispute Raised',
    'Refuses To Pay',
    'Requests Settlement',
    'Requests Callback'
  ];

  const nonContactableOptions = [
    'Ringing No Answer',
    'Switched Off',
    'Number Invalid',
    'Number Busy',
    'Wrong Number',
    'Not Reachable'
  ];

  const otherOptions = [
    'Third Party Contact',
    'Deceased',
    'Hospitalised',
    'Relocated',
    'Legal Notice Requested'
  ];

  // Load Priority Queue
  const loadQueue = async (autoSelectFirst = true) => {
    setLoadingQueue(true);
    try {
      const data = await api.get('/worklist/queue');
      setQueue(data.queue);
      setSummary(data.summary);

      if (autoSelectFirst && data.queue.length > 0) {
        selectAccount(data.queue[0].allocation_id);
      } else if (data.queue.length === 0) {
        setSelectedAccount(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadQueue(true);
  }, []);

  // Select Account and load full detail + history
  const selectAccount = async (allocationId: string) => {
    setLoadingAccount(true);
    setRevealedPhone(null);
    setPhoneAuditLogged(false);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await api.get(`/worklist/account/${allocationId}`);
      setSelectedAccount(data.account);
      setHistory(data.history);
      setPtps(data.ptps);
      // Pre-fill promised amount with total due as sensible default
      setPromisedAmount(data.account.total_due ? String(data.account.total_due) : '');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingAccount(false);
    }
  };

  // PRD 12.2: Reveal borrower phone on click & log into audit trail
  const handleRevealPhone = async () => {
    if (!selectedAccount) return;
    setRevealingPhone(true);
    setErrorMsg(null);

    try {
      const res = await api.post(`/worklist/account/${selectedAccount.allocation_id}/reveal-phone`);
      setRevealedPhone(res.borrower_phone);
      setPhoneAuditLogged(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reveal phone.');
    } finally {
      setRevealingPhone(false);
    }
  };

  // Submit Disposition
  const handleDispositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittingDisp(true);

    try {
      const payload: any = {
        allocationId: selectedAccount.allocation_id,
        contactMode,
        dispositionCode,
        subDisposition: subDisposition || null,
        remarks,
        nextActionDate: dispositionCategory !== 'Non Contactable' ? nextActionDate : null
      };

      if (dispositionCode === 'PTP Taken') {
        payload.promisedAmount = parseFloat(promisedAmount);
        payload.promisedDate = promisedDate;
      }

      const res = await api.post('/dispositions/capture', payload);
      setSuccessMsg('Disposition recorded successfully! Queue advancing...');

      // Reset form fields
      setRemarks('');
      setSubDisposition('');

      // Refresh queue and auto-select next
      setTimeout(() => {
        loadQueue(true);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingDisp(false);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'PTP_DUE_TODAY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            🔥 PTP Due Today
          </span>
        );
      case 'CALLBACK_DUE_TODAY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            ⏰ Callback Due
          </span>
        );
      case 'BROKEN_PTP':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-900 border border-red-200">
            ⚠️ Broken PTP
          </span>
        );
      case 'UNTOUCHED_HIGH_POS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            💎 High POS Untouched
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            In Worklist
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Priority Summary Banner */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total in Queue</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.totalInQueue}</div>
          </div>
          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-sm">
            <div className="text-xs text-rose-700 font-semibold flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
              PTP Due Today
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-1">{summary.ptpDueTodayCount}</div>
          </div>
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-sm">
            <div className="text-xs text-amber-700 font-semibold">Callbacks Today</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{summary.callbackDueTodayCount}</div>
          </div>
          <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-200 shadow-sm">
            <div className="text-xs text-red-700 font-semibold">Broken PTPs</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{summary.brokenPtpCount}</div>
          </div>
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-sm">
            <div className="text-xs text-emerald-700 font-semibold">Untouched High POS</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{summary.untouchedCount}</div>
          </div>
        </div>
      )}

      {/* Main Work Area: Split Screen (Left: Priority Queue, Right: Single Account Station) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Queue List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[740px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Priority Call Queue</h3>
              <p className="text-[11px] text-slate-500">Sorted strictly by PRD 9.3 priority algorithm</p>
            </div>
            <button
              onClick={() => loadQueue(false)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {loadingQueue ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading priority queue...</div>
            ) : queue.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                All priority accounts handled for today!
              </div>
            ) : (
              queue.map((acc) => {
                const isSelected = selectedAccount?.allocation_id === acc.allocation_id;
                return (
                  <div
                    key={acc.allocation_id}
                    onClick={() => selectAccount(acc.allocation_id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-orange-500/10 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-900 text-sm">{acc.borrower_name}</span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        ₹{acc.pos_amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                      <span className="font-mono">{acc.loan_id}</span>
                      <span>DPD {acc.dpd} ({acc.dpd_bucket})</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {getPriorityBadge(acc.queue_priority)}
                      <span className="text-[11px] text-slate-400 flex items-center">
                        {acc.client_name?.split(' ')[0]}
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Single Account Calling Station & Disposition (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loadingAccount ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Loading account data...
            </div>
          ) : selectedAccount ? (
            <div className="space-y-6">
              {/* Account Hero Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-black text-slate-900">{selectedAccount.borrower_name}</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {selectedAccount.client_name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        DPD {selectedAccount.dpd} ({selectedAccount.dpd_bucket})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      Loan Account ID: <span className="font-bold text-slate-700">{selectedAccount.loan_id}</span> | City: {selectedAccount.borrower_city || 'N/A'}
                    </div>
                  </div>

                  {/* Financial Stats in Hero */}
                  <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Total Demand / Due</div>
                      <div className="text-lg font-black text-rose-600 font-mono">
                        ₹{selectedAccount.total_due.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Principal (POS)</div>
                      <div className="text-lg font-black text-slate-800 font-mono">
                        ₹{selectedAccount.pos_amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRD 12.2: Masked Phone Reveal Box */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60 p-4 rounded-xl border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Borrower Contact Number</div>
                      <div className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                        {revealedPhone ? revealedPhone : selectedAccount.borrower_phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {!revealedPhone ? (
                      <button
                        type="button"
                        onClick={handleRevealPhone}
                        disabled={revealingPhone}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        {revealingPhone ? 'Decrypting...' : 'Reveal Phone (Audit Logged)'}
                      </button>
                    ) : (
                      <div className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
                        <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                        Revealed & Audited in DB
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disposition Capture Form (PRD Section 8) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                    Record Borrower Disposition
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    PRD Fixed Dispositions • No Free-text Status
                  </span>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-800 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleDispositionSubmit} className="space-y-4">
                  {/* Category Tabs: Contactable / Non Contactable / Other */}
                  <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setDispositionCategory('Contactable');
                        setDispositionCode(contactableOptions[0]);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dispositionCategory === 'Contactable'
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Contactable
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDispositionCategory('Non Contactable');
                        setDispositionCode(nonContactableOptions[0]);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dispositionCategory === 'Non Contactable'
                          ? 'bg-white text-amber-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Non Contactable
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDispositionCategory('Other');
                        setDispositionCode(otherOptions[0]);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dispositionCategory === 'Other'
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Other / Special
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Specific Disposition Code from Fixed List */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Disposition Code (Fixed List)
                      </label>
                      <select
                        value={dispositionCode}
                        onChange={(e) => setDispositionCode(e.target.value)}
                        className="mt-1 block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {dispositionCategory === 'Contactable' &&
                          contactableOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        {dispositionCategory === 'Non Contactable' &&
                          nonContactableOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        {dispositionCategory === 'Other' &&
                          otherOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    {/* Contact Mode */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Contact Mode
                      </label>
                      <select
                        value={contactMode}
                        onChange={(e) => setContactMode(e.target.value)}
                        className="mt-1 block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Phone">Phone Call</option>
                        <option value="WhatsApp Manual">WhatsApp (Manual 1-to-1)</option>
                        <option value="Visit">Field / Office Visit</option>
                      </select>
                    </div>
                  </div>

                  {/* PRD Section 8: PTP Taken mandatory inputs */}
                  {dispositionCode === 'PTP Taken' && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-fadeIn">
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-emerald-600" />
                        Promise To Pay (PTP) Terms (Mandatory per PRD)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-900">
                            Promised Amount (INR) *
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={promisedAmount}
                            onChange={(e) => setPromisedAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="mt-1 block w-full py-2 px-3 bg-white border border-emerald-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-900">
                            Promised Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={promisedDate}
                            onChange={(e) => setPromisedDate(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 bg-white border border-emerald-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PRD Section 8: Every disposition except non-contactable forces Next Action Date */}
                  {dispositionCategory !== 'Non Contactable' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Next Action / Follow-up Date (Mandatory) *
                      </label>
                      <input
                        type="date"
                        required
                        value={nextActionDate}
                        onChange={(e) => setNextActionDate(e.target.value)}
                        className="mt-1 block w-full md:w-1/2 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {/* Remarks (Free text) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Agent Remarks (Free Text) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Detailed notes from the conversation, reason for delay, next steps..."
                      className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingDisp}
                      className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      {submittingDisp ? 'Submitting...' : 'Save Disposition & Next'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Interaction Timeline & PTP History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                  <History className="w-4 h-4 mr-2 text-slate-500" />
                  Interaction Timeline & Audit History
                </h3>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No prior interactions logged for this account.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((h) => (
                      <div key={h.activity_id} className="relative pl-6 pb-4 border-l-2 border-slate-200 last:pb-0">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{h.disposition_code}</span>
                          <span className="text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          By <span className="font-semibold text-slate-700">{h.agent_name || 'Agent'}</span> via {h.contact_mode}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {h.remarks}
                        </p>
                        {h.next_action_date && (
                          <div className="text-[11px] text-amber-700 mt-1 flex items-center font-medium">
                            <Clock className="w-3 h-3 mr-1" /> Next Action: {h.next_action_date}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
              Select an account from the priority queue to begin calling.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
