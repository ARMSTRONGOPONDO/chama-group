import { useState, useCallback } from 'react';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chama_user') || 'null');
    } catch {
      return null;
    }
  });

  const login = useCallback((userData, token) => {
    localStorage.setItem('chama_token', token);
    localStorage.setItem('chama_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chama_token');
    localStorage.removeItem('chama_user');
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return { user, login, logout, isAuthenticated };
}
