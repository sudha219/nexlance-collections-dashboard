import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Shield,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { api } from '../services/api.js';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Agent');
  const [initialPassword, setInitialPassword] = useState('Initial#123456');
  const [teamLeaderId, setTeamLeaderId] = useState('');

  // Password Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('Reset#12345678');

  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.users || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setActionMsg(null);

    try {
      await api.post('/users', {
        userCode,
        name,
        email,
        role,
        initialPassword,
        teamLeaderId: teamLeaderId || null
      });

      setActionMsg(`User ${userCode} created successfully! Initial password will force change on first login.`);
      setShowCreateModal(false);
      setUserCode('');
      setName('');
      setEmail('');
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // PRD 6.7: Disable user in one click (terminates active sessions immediately)
  const handleToggleDisable = async (user: any) => {
    setErrorMsg(null);
    setActionMsg(null);

    try {
      if (user.active_flag === 1) {
        await api.post(`/users/${user.agent_id}/disable`);
        setActionMsg(`User ${user.user_code} disabled! All active sessions terminated immediately.`);
      } else {
        await api.post(`/users/${user.agent_id}/enable`);
        setActionMsg(`User ${user.user_code} reactivated!`);
      }
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // PRD 6.6: Unlock locked account
  const handleUnlock = async (agentId: string, userCode: string) => {
    try {
      await api.post(`/users/${agentId}/unlock`);
      setActionMsg(`Account ${userCode} unlocked.`);
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // PRD 6.4: Admin password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    try {
      await api.post(`/users/${selectedUserForReset.agent_id}/reset-password`, {
        newPassword: resetNewPassword
      });
      setActionMsg(`Password for ${selectedUserForReset.user_code} reset. Forced change required on next login.`);
      setShowResetModal(false);
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const teamLeaders = users.filter((u) => u.role === 'Team Leader');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management & Security Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin Controls • 1-Click Instant Session Termination • Mandatory TOTP • Account Lockout
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Create New User
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          {actionMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">System Users & Access Authority</h3>
          <span className="text-xs text-slate-400">{users.length} registered accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">User / Code</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">2FA (TOTP)</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Lockout</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.agent_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    {u.user_code}
                    <div className="text-[10px] text-slate-400 font-sans">{u.email}</div>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-900">{u.name}</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {u.totp_enabled === 1 ? (
                      <span className="text-emerald-700 font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Active
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Setup on 1st login</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {u.active_flag === 1 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Disabled (Sessions Revoked)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {u.is_locked ? (
                      <button
                        onClick={() => handleUnlock(u.agent_id, u.user_code)}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                      >
                        <Unlock className="w-3 h-3 mr-1" /> Locked (Click to Unlock)
                      </button>
                    ) : (
                      <span className="text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUserForReset(u);
                        setShowResetModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                      title="Reset Password"
                    >
                      Reset Pwd
                    </button>

                    <button
                      onClick={() => handleToggleDisable(u)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        u.active_flag === 1
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {u.active_flag === 1 ? 'Disable (1-Click)' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Application User</h3>
            <p className="text-xs text-slate-500 mb-4">
              PRD Section 6: Unique User ID, forced password change on first login, mandatory TOTP 2FA.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">User Code (Login ID) *</label>
                <input
                  type="text"
                  required
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="e.g. AGENT04, OPS02"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neha Gupta"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexlance.in"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Agent">Agent</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Ops Manager">Ops Manager</option>
                    <option value="Founder">Founder</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700">Team Leader</label>
                  <select
                    value={teamLeaderId}
                    onChange={(e) => setTeamLeaderId(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">None (Top level)</option>
                    {teamLeaders.map((tl) => (
                      <option key={tl.agent_id} value={tl.agent_id}>{tl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  Initial Password (min 12 chars) *
                </label>
                <input
                  type="text"
                  required
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reset Password for {selectedUserForReset.user_code}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              PRD 6.4: Super Admin can reset password. User will be forced to change it on next login.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">
                  New Temporary Password (min 12 chars) *
                </label>
                <input
                  type="text"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Apply Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
