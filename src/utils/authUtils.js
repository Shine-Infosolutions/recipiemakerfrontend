// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('userRole');
  console.log('Authentication data cleared');
};

// Check if token exists and is valid format
export const hasValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Basic check if token has 3 parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearAuthData();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token format:', error);
    clearAuthData();
    return false;
  }
};

export default {
  clearAuthData,
  hasValidToken
};