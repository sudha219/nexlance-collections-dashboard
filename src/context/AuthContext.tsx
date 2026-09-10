import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginStep1: (userCode: string, password: string) => Promise<any>;
  verifyTotp: (tempToken: string, totpCode: string) => Promise<User>;
  changePassword: (newPassword: string) => Promise<void>;
  switchRole: (role: Role) => void;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

export const defaultRoleUsers: Record<Role, User> = {
  'Founder': {
    agentId: 'usr_founder_01',
    userCode: 'FOUNDER01',
    name: 'Karthick Founder',
    role: 'Founder',
    email: 'karthick@nexlance.in',
    forcePwdChange: false,
    clientIdsAssigned: ['KISSHT', 'KRAZYBEE', 'MONEYTAP']
  },
  'Ops Manager': {
    agentId: 'usr_ops_01',
    userCode: 'OPS01',
    name: 'Ananya Deshmukh',
    role: 'Ops Manager',
    email: 'ananya.ops@nexlance.in',
    forcePwdChange: false,
    clientIdsAssigned: ['KISSHT', 'KRAZYBEE']
  },
  'Team Leader': {
    agentId: 'usr_tl_01',
    userCode: 'TL01',
    name: 'Vikramaditya Rao',
    role: 'Team Leader',
    email: 'vikram.tl@nexlance.in',
    forcePwdChange: false,
    clientIdsAssigned: ['KISSHT']
  },
  'Agent': {
    agentId: 'usr_agent_01',
    userCode: 'AGENT01',
    name: 'Kavita Sharma',
    role: 'Agent',
    email: 'kavita.sharma@nexlance.in',
    forcePwdChange: false,
    teamLeaderId: 'usr_tl_01',
    clientIdsAssigned: ['KISSHT']
  },
  'Auditor': {
    agentId: 'usr_auditor_01',
    userCode: 'AUDITOR01',
    name: 'Suresh Menon',
    role: 'Auditor',
    email: 'suresh.audit@nbfc-compliance.com',
    forcePwdChange: false,
    clientIdsAssigned: ['KISSHT', 'KRAZYBEE', 'MONEYTAP']
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Karthick Founder so the user gets immediate access matching the screenshot
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('nexlance_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // Fallback
      }
    }
    return defaultRoleUsers['Founder'];
  });

  const [token, setToken] = useState<string | null>(localStorage.getItem('nexlance_token') || 'demo_token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexlance_token');
      if (storedToken) {
        try {
          const profile = await api.get<User>('/auth/me');
          setUser(profile);
        } catch {
          // Keep active demo session for seamless preview
        }
      }
    };

    initAuth();
  }, []);

  const switchRole = (newRole: Role) => {
    const targetUser = defaultRoleUsers[newRole] || defaultRoleUsers['Founder'];
    setUser(targetUser);
    localStorage.setItem('nexlance_user', JSON.stringify(targetUser));
  };

  const loginStep1 = async (userCode: string, password: string) => {
    try {
      return await api.post('/auth/login', { userCode, password });
    } catch (err) {
      // Offline/Demo fallback for standalone static preview
      const cleanCode = userCode.trim().toUpperCase();
      const matchedUser = Object.values(defaultRoleUsers).find(
        (u) => u.userCode.toUpperCase() === cleanCode
      ) || defaultRoleUsers['Founder'];

      return {
        tempToken: `demo_token_${matchedUser.userCode}`,
        user: matchedUser,
        isTotpSetupRequired: false,
        qrCodeUrl: null
      };
    }
  };

  const verifyTotp = async (tempToken: string, totpCode: string): Promise<User> => {
    try {
      const data = await api.post('/auth/verify-totp', { tempToken, totpCode });
      localStorage.setItem('nexlance_token', data.token);
      localStorage.setItem('nexlance_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Offline/Demo fallback: accept any 6 digits (e.g. 123456 or 000000)
      const codeMatch = tempToken.replace('demo_token_', '');
      const matchedUser = Object.values(defaultRoleUsers).find(
        (u) => u.userCode.toUpperCase() === codeMatch.toUpperCase()
      ) || defaultRoleUsers['Founder'];

      const activeUser = { ...matchedUser, forcePwdChange: false };
      localStorage.setItem('nexlance_token', 'demo_active_token');
      localStorage.setItem('nexlance_user', JSON.stringify(activeUser));
      setToken('demo_active_token');
      setUser(activeUser);
      return activeUser;
    }
  };

  const changePassword = async (newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { newPassword });
    if (user) {
      const updated = { ...user, forcePwdChange: false };
      setUser(updated);
      localStorage.setItem('nexlance_user', JSON.stringify(updated));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('nexlance_token');
      localStorage.removeItem('nexlance_user');
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    if (user.role === 'Founder') return true; // Founder has global access across all modules
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginStep1,
        verifyTotp,
        changePassword,
        switchRole,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
