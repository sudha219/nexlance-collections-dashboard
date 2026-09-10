import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Layout } from './components/Layout.js';
import { Login } from './pages/Login.js';
import { AgentWorklist } from './pages/AgentWorklist.js';
import { AgentDashboard } from './pages/AgentDashboard.js';
import { TeamLeaderDashboard } from './pages/TeamLeaderDashboard.js';
import { FounderOpsDashboard } from './pages/FounderOpsDashboard.js';
import { AllocationUpload } from './pages/AllocationUpload.js';
import { PaymentRecon } from './pages/PaymentRecon.js';
import { ClientMISExport } from './pages/ClientMISExport.js';
import { UserManagement } from './pages/UserManagement.js';
import { AuditLogViewer } from './pages/AuditLogViewer.js';

// Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">
        Validating session with security authority...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles as any)) {
    return (
      <Layout>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="text-4xl">🔒</div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            Your role (<span className="font-semibold">{user.role}</span>) does not have authorization to view this module.
          </p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

// Root index redirector based on role
const RootRedirector: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'Agent') return <Navigate to="/worklist" replace />;
  if (user.role === 'Team Leader') return <Navigate to="/team-dashboard" replace />;
  return <Navigate to="/executive-dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootRedirector />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worklist"
            element={
              <ProtectedRoute allowedRoles={['Agent', 'Team Leader', 'Ops Manager', 'Founder']}>
                <AgentWorklist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Team Leader', 'Ops Manager', 'Founder']}>
                <TeamLeaderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/executive-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Founder', 'Ops Manager', 'Auditor']}>
                <FounderOpsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/allocation-upload"
            element={
              <ProtectedRoute allowedRoles={['Founder', 'Ops Manager']}>
                <AllocationUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-recon"
            element={
              <ProtectedRoute allowedRoles={['Founder', 'Ops Manager', 'Auditor']}>
                <PaymentRecon />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-export"
            element={
              <ProtectedRoute allowedRoles={['Founder', 'Ops Manager', 'Auditor']}>
                <ClientMISExport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['Founder']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-log"
            element={
              <ProtectedRoute allowedRoles={['Founder', 'Ops Manager', 'Auditor']}>
                <AuditLogViewer />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
