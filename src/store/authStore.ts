import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '../types';

// Mock auth service using localStorage
const mockAuth = {
  register: (email: string, password: string): { user: User; token: string } | null => {
    const users = JSON.parse(localStorage.getItem('ft_users') || '[]');
    if (users.find((u: any) => u.email === email)) return null;
    
    const user: User = {
      id: crypto.randomUUID(),
      email,
      createdAt: new Date().toISOString(),
    };
    users.push({ ...user, password });
    localStorage.setItem('ft_users', JSON.stringify(users));
    
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    localStorage.setItem('ft_token', token);
    return { user, token };
  },
  
  login: (email: string, password: string): { user: User; token: string } | null => {
    const users = JSON.parse(localStorage.getItem('ft_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) return null;
    
    const user: User = { id: found.id, email: found.email, createdAt: found.createdAt };
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    localStorage.setItem('ft_token', token);
    return { user, token };
  },
  
  logout: () => {
    localStorage.removeItem('ft_token');
  },
  
  getUser: (): User | null => {
    const token = localStorage.getItem('ft_token');
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('ft_token');
        return null;
      }
      const users = JSON.parse(localStorage.getItem('ft_users') || '[]');
      const user = users.find((u: any) => u.id === decoded.userId);
      if (!user) return null;
      return { id: user.id, email: user.email, createdAt: user.createdAt };
    } catch {
      return null;
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        const result = mockAuth.login(email, password);
        if (result) {
          set({ user: result.user, token: result.token, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      register: async (email: string, password: string) => {
        const result = mockAuth.register(email, password);
        if (result) {
          set({ user: result.user, token: result.token, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        mockAuth.logout();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'ft-auth',
    }
  )
);

// Initialize auth state from localStorage
const initAuth = () => {
  const user = mockAuth.getUser();
  const token = localStorage.getItem('ft_token');
  if (user && token) {
    useAuthStore.setState({ user, token, isAuthenticated: true });
  }
};

initAuth();
