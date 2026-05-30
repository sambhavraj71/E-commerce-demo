import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    console.log('Loading auth state - Token exists:', !!storedToken);
    console.log('Loading auth state - Token value:', storedToken ? storedToken.substring(0, 50) + '...' : 'null');
    console.log('Loading auth state - User:', storedUser);
    
    if (storedToken && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      console.log('No valid token or user found');
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    console.log('Login called - Saving token:', newToken ? newToken.substring(0, 50) + '...' : 'null');
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return { isAuthenticated, user, token, loading, login, logout };
};