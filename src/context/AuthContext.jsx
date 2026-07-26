import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ros_user');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ros_token', data.token);
    localStorage.setItem('ros_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('ros_token');
    localStorage.removeItem('ros_user');
    setUser(null);
  }

  function hasRole(...roles) {
    if (!user) return false;
    if (user.role === 'owner') return true;
    return roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
