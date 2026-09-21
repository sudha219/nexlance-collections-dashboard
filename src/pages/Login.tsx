import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { NEXLANCE_LOGO } from '../assets/logo.js';

export const Login: React.FC = () => {
  const { loginStep1, verifyTotp, changePassword } = useAuth();
  const navigate = useNavigate();

  // Multi-step states: 'CREDENTIALS' -> 'FORCE_PASSWORD' (optional) -> 'TOTP'
  const [step, setStep] = useState<'CREDENTIALS' | 'FORCE_PASSWORD' | 'TOTP'>('CREDENTIALS');
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isTotpSetupRequired, setIsTotpSetupRequired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Demo account selector for effortless evaluation
  const setDemoAccount = (code: string) => {
    setUserCode(code);
    setPassword('Password#1234');
    setError(null);
  };

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginStep1(userCode, password);
      setTempToken(res.tempToken);
      setIsTotpSetupRequired(res.isTotpSetupRequired);
      if (res.qrCodeUrl) {
        setQrCodeUrl(res.qrCodeUrl);
      }
      setStep('TOTP');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit TOTP 2FA
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await verifyTotp(tempToken, totpCode);
      if (loggedInUser.forcePwdChange) {
        setStep('FORCE_PASSWORD');
      } else {
        routeToRoleDashboard(loggedInUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid TOTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle Forced Password Change
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 12) {
      setError('PRD Requirement: Password must be at least 12 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setSuccessMsg('Password updated successfully!');
      setTimeout(() => {
        routeToRoleDashboard('Agent');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const routeToRoleDashboard = (role: string) => {
    switch (role) {
      case 'Agent':
        navigate('/worklist');
        break;
      case 'Team Leader':
        navigate('/team-dashboard');
        break;
      case 'Ops Manager':
      case 'Founder':
      case 'Auditor':
        navigate('/executive-dashboard');
        break;
      default:
        navigate('/worklist');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 flex items-center justify-center shadow-xl shadow-indigo-500/20 border border-white/20 backdrop-blur-sm">
            <img src={NEXLANCE_LOGO} alt="Nexlance Logo" className="w-full h-full object-contain filter drop-shadow" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Nexlance Collections System
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 uppercase tracking-wider font-semibold">
          PRD v0.1 • Mandatory TOTP 2FA • Internal Auth
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 'CREDENTIALS' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  User ID / Agent Code
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="e.g. FOUNDER01, AGENT01"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md shadow-emerald-600/30 transition-colors"
              >
                {loading ? 'Verifying...' : 'Continue to 2FA'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          )}

          {/* STEP 2: MANDATORY TOTP 2FA */}
          {step === 'TOTP' && (
            <form onSubmit={handleTotpSubmit} className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mandatory TOTP required for all users per PRD Section 6
                </p>
              </div>

              {qrCodeUrl && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 font-medium mb-2">Scan in Google Authenticator:</p>
                  <img src={qrCodeUrl} alt="TOTP QR Code" className="mx-auto w-36 h-36 rounded-lg shadow-sm" />
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">Secret: JBSWY3DPEHPK3PXP</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="000000"
                  className="mt-1.5 block w-full text-center py-3 tracking-widest text-2xl font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
                <span>Demo mode: Any 6 digits or test secret works.</span>
                <button
                  type="button"
                  onClick={async () => {
                    // Quick demo autofill
                    setTotpCode('123456');
                  }}
                  className="text-amber-900 font-bold underline ml-2"
                >
                  Quick Fill
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-colors"
                >
                  {loading ? 'Authenticating...' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: FORCED PASSWORD CHANGE */}
          {step === 'FORCE_PASSWORD' && (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Forced Password Change</h3>
                <p className="text-xs text-slate-500 mt-1">
                  PRD Section 6.2: First login requires setting a password of at least 12 characters.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  New Password (min 12 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 12 characters"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="mt-1 block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                {loading ? 'Updating Password...' : 'Save & Continue'}
              </button>
            </form>
          )}

          {/* Quick Demo Profile Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Role Switcher (Preloaded Demo)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('FOUNDER01')}
                className="p-2 text-left rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <span className="font-bold text-purple-900 block">Founder</span>
                <span className="text-[10px] text-purple-600 font-mono">FOUNDER01</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('OPS01')}
                className="p-2 text-left rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <span className="font-bold text-blue-900 block">Ops Manager</span>
                <span className="text-[10px] text-blue-600 font-mono">OPS01</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('TL01')}
                className="p-2 text-left rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <span className="font-bold text-amber-900 block">Team Leader</span>
                <span className="text-[10px] text-amber-600 font-mono">TL01</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('AGENT01')}
                className="p-2 text-left rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span className="font-bold text-emerald-900 block">Agent (Calling)</span>
                <span className="text-[10px] text-emerald-600 font-mono">AGENT01</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('AUDITOR01')}
                className="p-2 text-left rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors col-span-2"
              >
                <span className="font-bold text-slate-900 block">External Auditor (Read-Only)</span>
                <span className="text-[10px] text-slate-600 font-mono">AUDITOR01</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Password: Password#1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};
