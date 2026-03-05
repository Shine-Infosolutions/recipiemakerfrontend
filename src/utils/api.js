const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    const data = await response.json();
    if (data.logout) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/';
      return;
    }
  }

  return response;
};

export { API_URL };