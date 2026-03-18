// API utility with automatic logout on 401 errors
export const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 errors by clearing auth data
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      
      // Reload the page to trigger login
      window.location.reload();
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const apiGet = (url) => apiRequest(url);

export const apiPost = (url, data) => apiRequest(url, {
  method: 'POST',
  body: JSON.stringify(data)
});

export const apiPut = (url, data) => apiRequest(url, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const apiDelete = (url) => apiRequest(url, {
  method: 'DELETE'
});

export default {
  API_URL,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
};