import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = __VITE_API_URL__;
axios.defaults.baseURL = `${API_URL}/api`;
axios.defaults.withCredentials = true; // IMPORTANT for cookies

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
      setRoles(response.data.user.roles || []);
    } catch (error) {
      setUser(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Axios interceptor to handle 401 and try refreshing token
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
          originalRequest._retry = true;
          try {
            await axios.post('/auth/refresh');
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            setUser(null);
            setRoles([]);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    fetchUser();

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (username, password) => {
    const response = await axios.post('/auth/login', { username, password });
    setUser(response.data.user);
    setRoles(response.data.user.roles || []);
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRoles([]);
    }
  };

  const hasRole = (role) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, roles, loading, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
