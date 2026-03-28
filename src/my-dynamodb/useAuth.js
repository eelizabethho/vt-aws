import { useState, useCallback } from 'react';

/**
 * Holds the currently logged-in Google user.
 *
 * Usage:
 *   const { user, login, logout } = useAuth();
 *
 * user shape: { userId, email, name, credential } or null if not logged in
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    // Persist login across page refreshes
    try {
      const saved = localStorage.getItem('vt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userInfo) => {
    setUser(userInfo);
    localStorage.setItem('vt_user', JSON.stringify(userInfo));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vt_user');
  }, []);

  return { user, login, logout };
}
