import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('photolab_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setAdmin(res.data.admin))
      .catch(() => {
        localStorage.removeItem('photolab_access_token');
        localStorage.removeItem('photolab_admin');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('photolab_access_token', res.data.session.access_token);
    localStorage.setItem('photolab_refresh_token', res.data.session.refresh_token);
    localStorage.setItem('photolab_admin', JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data.admin;
  }

  function logout() {
    localStorage.removeItem('photolab_access_token');
    localStorage.removeItem('photolab_refresh_token');
    localStorage.removeItem('photolab_admin');
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, setAdmin, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
