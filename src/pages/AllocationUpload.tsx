import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Users,
  Filter,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';

export const AllocationUpload: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [monthTag, setMonthTag] = useState(new Date().toISOString().substring(0, 7)); // 'YYYY-MM'
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Assignment Modal
  const [selectedBatchForAssign, setSelectedBatchForAssign] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<'ROUND_ROBIN' | 'BULK_FILTER'>('ROUND_ROBIN');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [targetAgentId, setTargetAgentId] = useState('');
  const [filterBucket, setFilterBucket] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMinPos, setFilterMinPos] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [cRes, uRes, bRes] = await Promise.all([
        api.get('/clients'),
        api.get('/users'),
        api.get('/allocations/batches')
      ]);
      setClients(cRes.clients || []);
      if (cRes.clients?.length > 0 && !selectedClientId) {
        setSelectedClientId(cRes.clients[0].client_id);
      }
      setAgents((uRes.users || []).filter((u: any) => u.role === 'Agent' && u.active_flag === 1));
      setBatches(bRes.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setUploadResult(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a CSV allocation file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', selectedClientId);
    formData.append('monthTag', monthTag);

    try {
      const result = await api.post('/allocations/upload', formData);
      setUploadResult(result);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Allocation upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Sample CSV generator for testing
  const downloadSampleCsv = () => {
    const csvContent =
      'loan_id,borrower_name,borrower_phone,borrower_city,dpd,pos_amount,emi_due_amount,total_due\n' +
      'KIS-NEW-101,Ramesh Patel,+919821098765,Mumbai,34,45000,5200,10400\n' +
      'KIS-NEW-102,Deepa Sharma,+919811223344,Delhi,65,72000,8900,26700\n' +
      'KIS-NEW-103,Manoj Joshi,+919845012345,Bangalore,88,110000,14500,43500\n' +
      'KIS-NEW-104,Anita Sen,+919830099887,Kolkata,12,28000,3400,3400\n' +
      'KIS-NEW-105,Gaurav Malhotra,+919412034567,Chandigarh,95,150000,21000,84000\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sample_Allocation_${selectedClientId || 'NBFC'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    setAssignResult(null);

    try {
      if (assignMode === 'ROUND_ROBIN') {
        const res = await api.post('/allocations/assign/round-robin', {
          batchId: selectedBatchForAssign,
          agentIds: selectedAgentIds
        });
        setAssignResult(`Successfully distributed ${res.assignedCount} loans evenly across ${selectedAgentIds.length} agents!`);
      } else {
        const res = await api.post('/allocations/assign/filter', {
          targetAgentId,
          filter: {
            batchId: selectedBatchForAssign || undefined,
            dpdBucket: filterBucket || undefined,
            city: filterCity || undefined,
            minPos: filterMinPos ? parseFloat(filterMinPos) : undefined
          }
        });
        setAssignResult(`Successfully assigned ${res.assignedCount} matching loans to selected agent!`);
      }
      loadData();
    } catch (err: any) {
      setAssignResult(`Assignment error: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Allocation Batch Upload & Distribution</h1>
          <p className="text-xs text-slate-500 mt-1">
            PRD Section 9.1 & 9.2: Template header validation, deduplication on loan_id, round-robin & bulk assignment
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
          Download Sample NBFC CSV
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <UploadCloud className="w-5 h-5 mr-2 text-emerald-600" />
          Upload New Client Allocation File
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
                Target NBFC Client *
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
                Allocation Month Tag (YYYY-MM) *
              </label>
              <input
                type="month"
                required
                value={monthTag}
                onChange={(e) => setMonthTag(e.target.value)}
                className="mt-1 block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Allocation Spreadsheet (CSV / Excel)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".csv"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-800 block">
                  {file ? file.name : 'Click to select or drag and drop CSV file'}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Handles up to 50,000 rows asynchronously with row-level validation
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {uploading ? 'Processing Batch...' : 'Upload & Deduplicate'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>

        {/* Upload Success & Row Error Summary */}
        {uploadResult && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              Batch Ingested Successfully!
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-medium">
              <div>Total File Rows: <span className="font-bold">{uploadResult.totalRows}</span></div>
              <div>Inserted in Unassigned: <span className="font-bold">{uploadResult.insertedCount}</span></div>
              <div>Deduplicated Loans: <span className="font-bold">{uploadResult.duplicateCount}</span></div>
              <div>Row Errors: <span className="font-bold">{uploadResult.errors.length}</span></div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-emerald-300">
                <div className="font-bold text-rose-700 mb-1">Row Level Validation Errors:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 max-h-28 overflow-y-auto">
                  {uploadResult.errors.map((e: any, idx: number) => (
                    <li key={idx}>Row {e.row}: {e.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignment Engine (PRD Section 9.2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-emerald-600" />
          Assignment Engine: Distribute to Agents
        </h3>

        {assignResult && (
          <div className="mb-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
            {assignResult}
          </div>
        )}

        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 w-full md:w-96">
            <button
              type="button"
              onClick={() => setAssignMode('ROUND_ROBIN')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                assignMode === 'ROUND_ROBIN'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Round Robin (Even Split)
            </button>
            <button
              type="button"
              onClick={() => setAssignMode('BULK_FILTER')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                assignMode === 'BULK_FILTER'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bulk Filter Assign
            </button>
          </div>

          {/* Mode 1: Round Robin */}
          {assignMode === 'ROUND_ROBIN' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Select Active Agents for Round Robin Distribution
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {agents.map((ag) => {
                  const isChecked = selectedAgentIds.includes(ag.agent_id);
                  return (
                    <label
                      key={ag.agent_id}
                      className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-medium cursor-pointer transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgentIds([...selectedAgentIds, ag.agent_id]);
                          } else {
                            setSelectedAgentIds(selectedAgentIds.filter((id) => id !== ag.agent_id));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{ag.name} ({ag.user_code})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Bulk Filter */}
          {assignMode === 'BULK_FILTER' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700">DPD Bucket</label>
                  <select
                    value={filterBucket}
                    onChange={(e) => setFilterBucket(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">Any DPD</option>
                    <option value="1-30">1-30 DPD</option>
                    <option value="31-60">31-60 DPD</option>
                    <option value="61-90">61-90 DPD</option>
                    <option value="90+">90+ DPD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700">City Filter</label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi"
                    className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700">Min POS (INR)</label>
                  <input
                    type="number"
                    value={filterMinPos}
                    onChange={(e) => setFilterMinPos(e.target.value)}
                    placeholder="e.g. 50000"
                    className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700">Assignee Agent</label>
                  <select
                    required
                    value={targetAgentId}
                    onChange={(e) => setTargetAgentId(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">Select target agent...</option>
                    {agents.map((ag) => (
                      <option key={ag.agent_id} value={ag.agent_id}>
                        {ag.name} ({ag.user_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={assigning || (assignMode === 'ROUND_ROBIN' && selectedAgentIds.length === 0)}
              className="inline-flex items-center px-6 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {assigning ? 'Distributing...' : 'Execute Allocation Assignment'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Ingested Allocation Batches</h3>
          <span className="text-xs text-slate-400">{batches.length} batches logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Batch ID</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">File Name</th>
                <th className="px-4 py-3.5">Month Tag</th>
                <th className="px-4 py-3.5 text-right">Record Count</th>
                <th className="px-4 py-3.5">Uploaded By</th>
                <th className="px-6 py-3.5">Upload Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batches.map((b) => (
                <tr key={b.batch_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-slate-700">{b.batch_id.slice(0, 12)}...</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{b.client_name}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{b.file_name}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{b.month_tag}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">{b.record_count}</td>
                  <td className="px-4 py-3.5 text-slate-600">{b.uploader_name}</td>
                  <td className="px-6 py-3.5 text-slate-400">{new Date(b.uploaded_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
