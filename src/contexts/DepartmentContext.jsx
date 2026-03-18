import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, API_URL } from '../utils/apiUtils';

const DepartmentContext = createContext();

export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const data = await apiGet(`${API_URL}/departments`);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.message);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments only once when the provider mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDepartments();
    } else {
      setLoading(false);
    }
  }, []);

  // Function to refresh departments (can be called when departments are updated)
  const refreshDepartments = () => {
    fetchDepartments();
  };

  const value = {
    departments,
    loading,
    error,
    refreshDepartments
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};