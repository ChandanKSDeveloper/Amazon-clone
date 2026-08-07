// services/tokenService.js
const isClient = typeof window !== 'undefined';

export const tokenService = {
  getToken: () => {
    if (!isClient) return null;
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.warn('Error getting token:', error);
      return null;
    }
  },
  
  setToken: (token) => {
    if (!isClient) return;
    try {
      localStorage.setItem('token', token);
    } catch (error) {
      console.warn('Error setting token:', error);
    }
  },
  
  removeToken: () => {
    if (!isClient) return;
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('Error removing token:', error);
    }
  }
};