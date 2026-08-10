import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { AppUser } from '../types/api';

import { authApi } from '../services/auth-api';
import { setAuthToken } from '../services/http-client';

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AppUser) => void;
  logout: () => Promise<void>;
};

const TOKEN_STORAGE_KEY = 'lfms_token';
const USER_STORAGE_KEY = 'lfms_user';

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredState = (): { token: string | null; user: AppUser | null } => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const userText = localStorage.getItem(USER_STORAGE_KEY);
  const user = userText ? (JSON.parse(userText) as AppUser) : null;
  return { token, user };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const initial = readStoredState();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AppUser | null>(initial.user);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(initial.token));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const syncUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.me();
        setUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    void syncUser();
  }, [token]);

  const login = (nextToken: string, nextUser: AppUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API logout failures and clear local session anyway.
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
