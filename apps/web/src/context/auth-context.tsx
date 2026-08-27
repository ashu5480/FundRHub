'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { errorMessage, getMe, login as apiLogin, logout as apiLogout, registerUser } from '@/lib/api';
import { UserRole } from '@/lib/enums';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate the session from the cookie-backed /me endpoint on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: me } = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: loggedIn } = await apiLogin(email, password);
      setUser(loggedIn);
      return true;
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  }, []);

  const register = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      await registerUser({ email, password, role });
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updated: User) => setUser(updated), []);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      refresh,
    }),
    [user, isLoading, login, register, logout, updateUser, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
