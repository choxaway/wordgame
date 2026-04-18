import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wg_token'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (token) {
      api.me(token).then(u => { setUser(u); setLoading(false); }).catch(() => { setToken(null); localStorage.removeItem('wg_token'); setLoading(false); });
    } else { setLoading(false); }
  }, []);
  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.token); setUser(data.user);
    localStorage.setItem('wg_token', data.token);
    return data;
  };
  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password });
    setToken(data.token); setUser(data.user);
    localStorage.setItem('wg_token', data.token);
    return data;
  };
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('wg_token'); };
  return <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
