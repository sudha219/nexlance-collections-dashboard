import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Building2,
  RefreshCw,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '../types/index.js';
import { NEXLANCE_LOGO } from '../assets/logo.js';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Executive Command & MIS',
      path: '/executive-dashboard',
      icon: LayoutDashboard,
      badge: 'Command',
      roles: ['Founder', 'Ops Manager', 'Auditor']
    },
    {
      label: 'Priority Calling Queue',
      path: '/worklist',
      icon: PhoneCall,
      badge: 'Priority',
      roles: ['Agent', 'Team Leader', 'Ops Manager', 'Founder']
    },
    {
      label: 'Allocation & Ingestion',
      path: '/allocation-upload',
      icon: UploadCloud,
      roles: ['Founder', 'Ops Manager']
    },
    {
      label: 'Payment Recon & Match',
      path: '/payment-recon',
      icon: CheckCircle2,
      roles: ['Founder', 'Ops Manager', 'Auditor']
    },
    {
      label: 'Client Portfolio Master',
      path: '/mis-export',
      icon: Building2,
      roles: ['Founder', 'Ops Manager', 'Auditor']
    },
    {
      label: 'Staff & Role Admin',
      path: '/users',
      icon: Users,
      roles: ['Founder']
    },
    {
      label: 'Audit Trail & Integrity',
      path: '/audit-log',
      icon: ShieldCheck,
      roles: ['Founder', 'Ops Manager', 'Auditor']
    }
  ];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    if (switchRole) {
      switchRole(newRole);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'K';

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f6fa] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sleek Top Bar with Obsidian Slate Palette */}
      <header className="bg-[#0a0f1d] text-white border-b border-slate-800/80 sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & System Info */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 backdrop-blur-sm">
              <img
                src={NEXLANCE_LOGO}
                alt="Nexlance Collections Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Nexlance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-medium">Collections</span>
                </span>
                <span className="text-[10px] font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PRD v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                NBFC Delinquency System of Record • Kissht • KrazyBee • MoneyTap
              </p>
            </div>
          </div>

          {/* Controls & User Profile */}
          <div className="flex items-center space-x-3.5">
            {/* TOTP 2FA Verified Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>2FA Verified</span>
            </div>

            {/* Switch Active Role Dropdown */}
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-[#12192d] px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-sm hover:border-slate-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 hidden md:inline">Role:</span>
              <select
                value={user?.role || 'Founder'}
                onChange={handleRoleChange}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="Founder" className="bg-slate-900 text-white">Founder (Karthick)</option>
                <option value="Ops Manager" className="bg-slate-900 text-white">Ops Manager (Ananya)</option>
                <option value="Team Leader" className="bg-slate-900 text-white">Team Leader (Vikram)</option>
                <option value="Agent" className="bg-slate-900 text-white">Agent (Kavita)</option>
                <option value="Auditor" className="bg-slate-900 text-white">Auditor (Suresh)</option>
              </select>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">{user?.name || 'Karthick Founder'}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-500/30">
                    {user?.role || 'Founder'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{user?.email || 'karthick@nexlance.in'}</div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <div className="flex-1 flex w-full">
        {/* Modern Obsidian Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between py-6 px-3.5 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80 px-3 mb-2 flex items-center justify-between">
                <span>OPERATIONAL WORKFLOW</span>
                <Layers className="w-3 h-3 text-slate-400" />
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === '/executive-dashboard' && location.pathname === '/');

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#facc15] via-[#38bdf8] via-[#a855f7] to-[#fb923c] text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                        <span className={isActive ? 'text-slate-950 font-black tracking-tight' : ''}>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            isActive
                              ? 'bg-slate-950 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Security Compliance Badge */}
          <div className="pt-4 border-t border-slate-800/80 px-2.5">
            <div className="bg-[#12192d] p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Nexlance Core
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5 font-mono">
                <div>• Audit Log: Immutable</div>
                <div>• Phone Masking: Enabled</div>
                <div>• RLS Isolation: Active</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Canvas */}
        <main className="flex-1 min-w-0 p-5 sm:p-7 bg-[#f3f6fa]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
