'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { currentUser, investorUser } from '@/lib/data';
import { UserRole, UserStatus } from '@/lib/enums';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchUser: (user: User) => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(currentUser);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login: any credentials work for demo
    const matchedUser =
      email.includes('investor') || email.includes('amit') ? investorUser : currentUser;
    setUser(matchedUser);
    return true;
  };

  const register = async (email: string, _password: string, role: UserRole) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      role,
      status: UserStatus.PENDING_VERIFICATION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchUser = (newUser: User) => {
    setUser(newUser);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}