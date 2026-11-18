import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { User, Shop, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateShop: (data: Partial<Shop>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('aurajewel_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
        setShop(response.data.data.shop);
      }
    } catch (err) {
      console.warn('Session verification failed:', err);
      localStorage.removeItem('aurajewel_token');
      setUser(null);
      setShop(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', credentials);
      const { user, shop, accessToken } = response.data.data;
      localStorage.setItem('aurajewel_token', accessToken);
      setUser(user);
      setShop(shop);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', formData);
      const { user, shop, accessToken } = response.data.data;
      localStorage.setItem('aurajewel_token', accessToken);
      setUser(user);
      setShop(shop);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('aurajewel_token');
      setUser(null);
      setShop(null);
      window.location.href = '/login';
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateShop = (updated: Partial<Shop>) => {
    if (shop) {
      setShop({ ...shop, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
