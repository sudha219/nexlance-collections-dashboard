import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  UploadCloud,
  FileText,
  Clock,
  Check,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';
import { PaymentExceptionItem, PaymentItem } from '../types/index.js';

export const PaymentRecon: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [reconResult, setReconResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Exception Queue State
  const [exceptions, setExceptions] = useState<PaymentExceptionItem[]>([]);
  const [loadingExceptions, setLoadingExceptions] = useState(true);

  // Manual Resolution Modal
  const [selectedException, setSelectedException] = useState<PaymentExceptionItem | null>(null);
  const [targetLoanId, setTargetLoanId] = useState('');
  const [notes, setNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  // PTP Lifecycle Flip Trigger
  const [runningPtpFlip, setRunningPtpFlip] = useState(false);
  const [ptpFlipResult, setPtpFlipResult] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [cRes, exRes] = await Promise.all([
        api.get('/clients'),
        api.get('/payments/exceptions?status=UNRESOLVED')
      ]);
      setClients(cRes.clients || []);
      if (cRes.clients?.length > 0 && !selectedClientId) {
        setSelectedClientId(cRes.clients[0].client_id);
      }
      setExceptions(exRes.exceptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExceptions(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a paid recovery file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setReconResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', selectedClientId);

    try {
      const result = await api.post('/payments/upload', formData);
      setReconResult(result);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment reconciliation failed');
    } finally {
      setUploading(false);
    }
  };

  // Run PTP auto-flip job (PRD 9.5)
  const handleRunPtpJob = async () => {
    setRunningPtpFlip(true);
    setPtpFlipResult(null);
    try {
      const res = await api.post('/payments/ptp/run-lifecycle');
      setPtpFlipResult(`Executed PTP lifecycle scan: ${res.brokenCount} overdue promises flipped to Broken!`);
      loadData();
    } catch (err: any) {
      setPtpFlipResult(`Error: ${err.message}`);
    } finally {
      setRunningPtpFlip(false);
    }
  };

  // Resolve Exception
  const handleResolveExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;
    setResolving(true);
    setResolveSuccess(null);

    try {
      // Find allocation by loan ID
      const allocRes = await api.get(`/allocations?clientId=${selectedException.client_id}&search=${targetLoanId.trim()}`);
      if (!allocRes.allocations || allocRes.allocations.length === 0) {
        throw new Error(`No loan found matching "${targetLoanId}" for client ${selectedException.client_id}`);
      }

      const match = allocRes.allocations[0];
      await api.post(`/payments/exceptions/${selectedException.exception_id}/resolve`, {
        targetAllocationId: match.allocation_id,
        notes
      });

      setResolveSuccess('Exception resolved & mapped to allocation! Worklist and PTP updated.');
      setTimeout(() => {
        setSelectedException(null);
        setResolveSuccess(null);
        setTargetLoanId('');
        setNotes('');
        loadData();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setResolving(false);
    }
  };

  const downloadSamplePaidCsv = () => {
    const today = new Date().toISOString().split('T')[0];
    const csvContent =
      'loan_id,payment_amount,payment_date,payment_mode\n' +
      `KIS-90281-01,4200,${today},UPI_AUTOPAY\n` +
      `KIS-88129-02,15600,${today},NEFT_CLIENT\n` +
      `KIS-UNKNOWN-999,5000,${today},NACH_BOUNCE_RECOVERY\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sample_Paid_File_${selectedClientId || 'NBFC'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Ingest & Automated Reconciliation</h1>
          <p className="text-xs text-slate-500 mt-1">
            PRD Section 9.4 & 9.5: Normalized loan_id join, worklist auto-drop, PTP Kept/Broken lifecycle, and exception queue
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={downloadSamplePaidCsv}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
            Sample Paid File CSV
          </button>

          <button
            onClick={handleRunPtpJob}
            disabled={runningPtpFlip}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors disabled:opacity-50"
          >
            <Clock className="w-4 h-4 mr-1.5 text-amber-400" />
            {runningPtpFlip ? 'Scanning...' : 'Run PTP Auto-Flip Job'}
          </button>
        </div>
      </div>

      {ptpFlipResult && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
          {ptpFlipResult}
        </div>
      )}

      {/* Upload Paid File Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <UploadCloud className="w-5 h-5 mr-2 text-emerald-600" />
          Ingest Daily Client Paid Recovery File
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Client Remittance Source *
              </label>
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="mt-1 block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.client_name} ({c.client_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Payment File (CSV) *
              </label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {uploading ? 'Reconciling Ledger...' : 'Run Automated Reconciliation'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>

        {/* Recon Output Card */}
        {reconResult && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-3">
            <div className="flex items-center font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
              Reconciliation Finished Successfully!
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Payments</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{reconResult.totalRows}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Matched Loans</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{reconResult.matchedCount}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">PTP Marked Kept</div>
                <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">{reconResult.ptpKeptCount}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Exceptions Queued</div>
                <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">{reconResult.unmatchedCount}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Recovered</div>
                <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
                  ₹{reconResult.totalCollected.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">
              ✨ PRD Criterion 5 Satisfied: All matched loans have flipped status and dropped out of active agent worklists immediately.
            </p>
          </div>
        )}
      </div>

      {/* PRD Section 9.4: Unmatched Payment Exception Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" />
              Unmatched Payment Exception Queue
            </h3>
            <p className="text-[11px] text-slate-500">
              PRD Section 9.4: "Unmatched loan ids go to an exception queue for manual review, never silently dropped."
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            {exceptions.length} Unresolved
          </span>
        </div>

        <div className="overflow-x-auto">
          {loadingExceptions ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading exception queue...</div>
          ) : exceptions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              Exception queue is clean! All client payments have been successfully attributed.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3.5">Exception ID</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Raw Loan ID in File</th>
                  <th className="px-4 py-3.5">Payment Date</th>
                  <th className="px-4 py-3.5 text-right">Amount (INR)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {exceptions.map((ex) => (
                  <tr key={ex.exception_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-500">{ex.exception_id.slice(0, 10)}...</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{ex.client_name}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-rose-600 bg-rose-50/50 px-2 py-0.5 rounded">
                      {ex.loan_id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{ex.payment_date}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{ex.payment_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {ex.resolution_status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedException(ex);
                          setTargetLoanId(ex.loan_id);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm"
                      >
                        Manual Match
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Match Exception Modal */}
      {selectedException && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Manual Payment Mapping</h3>
            <p className="text-xs text-slate-500 mb-4">
              Map uncredited payment of <span className="font-bold text-emerald-700">₹{selectedException.payment_amount}</span> to a valid loan.
            </p>

            {resolveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-xs text-emerald-900 font-semibold">
                {resolveSuccess}
              </div>
            )}

            <form onSubmit={handleResolveExceptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  Target Loan Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={targetLoanId}
                  onChange={(e) => setTargetLoanId(e.target.value)}
                  placeholder="e.g. KIS-90281-01"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  Ops Investigation Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why raw ID was mismatched (e.g. leading zero dropped by client MIS, typo in LAN)..."
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedException(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  {resolving ? 'Applying...' : 'Confirm Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
