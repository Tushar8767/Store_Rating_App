import { createContext, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  function saveSession({ token, user }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  // If the API says the token is no longer valid, log out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  const login = async (email, password) => saveSession(await api.login({ email, password }));
  const register = async (form) => saveSession(await api.register(form));

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
