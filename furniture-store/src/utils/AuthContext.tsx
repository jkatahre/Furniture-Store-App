import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './data/users';
import * as authService from '../services/authService';
import { blurActiveElement, enableBackgroundInert, disableBackgroundInert } from './domUtils';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., in localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Blur focused element and make background inert before showing overlays
    blurActiveElement();
    enableBackgroundInert();
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      // If server returned a token, fetch the authoritative profile
      if (res.token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile as User);
        } catch (e) {
          setUser(res.user as User);
        }
      } else {
        setUser(res.user as User);
      }
      setLoading(false);
      disableBackgroundInert();
      return Promise.resolve();
    } catch (err) {
      setLoading(false);
      disableBackgroundInert();
      return Promise.reject(err);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    blurActiveElement();
    enableBackgroundInert();
    setLoading(true);
    try {
      const res = await authService.register(name, email, password);
      // After registration, prefer fetching profile when token present
      if (res.token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile as User);
        } catch (e) {
          setUser(res.user as User);
        }
      } else {
        setUser(res.user as User);
      }
      setLoading(false);
      disableBackgroundInert();
      return Promise.resolve();
    } catch (err) {
      setLoading(false);
      disableBackgroundInert();
      return Promise.reject(err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
