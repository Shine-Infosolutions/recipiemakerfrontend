import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdDelete, MdCalendarToday } from 'react-icons/md';
import { BiError } from 'react-icons/bi';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useUser } from '../../contexts/UserContext';
import { canDelete, canViewAllDepartments } from '../../utils/permissions';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const SemiFinished = () => {
  const [cancelledRecipes, setCancelledRecipes] = useState([]);
  const [filteredCancelledRecipes, setFilteredCancelledRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const { departments } = useDepartments();
  const { user } = useUser();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const userRole = user?.role || 'store';

  useEffect(() => {
    fetchCancelledRecipes();
    fetchRecipes();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    let filtered = cancelledRecipes;
    
    if (canViewAllDepartments(userRole)) {
      if (selectedDepartment) {
        filtered = filtered.filter(item => 
          item.recipeId?.departmentId?._id === selectedDepartment
        );
      }
    } else {
      // Kitchen and other users see only their department's items
      if (user?.departmentId) {
        filtered = filtered.filter(item => 
          item.recipeId?.departmentId?._id === user.departmentId
        );
      }
    }
    
    setFilteredCancelledRecipes(filtered);
  }, [cancelledRecipes, selectedDepartment, userRole, user]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchCancelledRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cooked-items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch cancelled recipes');
        setCancelledRecipes([]);
        return;
      }
      
      const data = await res.json();
      setCancelledRecipes(data.filter(item => item.status === 'semi-finished'));
    } catch (error) {
      console.error('Error:', error);
      setCancelledRecipes([]);
    }
    setLoading(false);
  };

  const deleteRecipe = async (id) => {
    await fetch(`${API_URL}/semi-finished-goods/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCancelledRecipes();
  };

  const filterRecipes = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return filteredCancelledRecipes.filter(recipe => {
      if (!recipe.createdAt) return false;
      const recipeDate = new Date(recipe.createdAt);
      
      if (filterType === 'today') {
        return recipeDate >= today;
      } else if (filterType === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return recipeDate >= start && recipeDate <= end;
      }
      return true;
    });
  };

  const filteredRecipes = filterRecipes();

  // Pagination logic
  const totalItems = filteredRecipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, filterType, startDate, endDate, filteredCancelledRecipes.length]);

  return (
    <>
      <div style={{ 
        marginTop: window.innerWidth < 768 ? '0px' : '0px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BiError style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Semi-Finished
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Cancelled recipes with restocked ingredients</p>}
          </div>
          {canViewAllDepartments(userRole) && (
            <select
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '150px',
                color: '#2d3436'
              }}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Date Filter Controls */}
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginRight: '8px' }}>Filter by:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  background: 'white',
                  color: '#2d3436'
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="range">Date Range</option>
              </select>
            </div>
            
            {filterType === 'range' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdCalendarToday style={{ fontSize: '16px', color: '#667eea' }} />
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginRight: '8px' }}>From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      color: '#2d3436',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      colorScheme: 'light'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdCalendarToday style={{ fontSize: '16px', color: '#667eea' }} />
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginRight: '8px' }}>To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      color: '#2d3436',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      colorScheme: 'light'
                    }}
                  />
                </div>
              </>
            )}
            
            {/* Date Range Display */}
            {filterType === 'today' && (
              <div style={{ 
                padding: '8px 12px', 
                background: '#e8f5e9', 
                border: '1px solid #00b894', 
                borderRadius: '6px', 
                fontSize: '14px', 
                color: '#2d3436', 
                fontWeight: '600'
              }}>
                Showing: Today ({new Date().toLocaleDateString('en-GB')})
              </div>
            )}
            
            {filterType === 'range' && startDate && endDate && (
              <div style={{ 
                padding: '8px 12px', 
                background: '#fff3e0', 
                border: '1px solid #ffa502', 
                borderRadius: '6px', 
                fontSize: '14px', 
                color: '#2d3436', 
                fontWeight: '600'
              }}>
                Showing: {new Date(startDate).toLocaleDateString('en-GB')} to {new Date(endDate).toLocaleDateString('en-GB')}
              </div>
            )}
          </div>
        </div>
        {loading ? <Loading /> : (
        <>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Department</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Restocked</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecipes.map((recipe) => {
                return (
                <tr key={recipe._id} style={{ borderBottom: '1px solid #e9ecef', borderLeft: '3px solid #ffa502' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {recipe.title}
                      {recipe.isAdjusted && (
                        <span style={{
                          fontSize: '10px',
                          color: '#ff6b35',
                          background: '#fff3e0',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          border: '1px solid #ffcc99'
                        }}>
                          ADJUSTED
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {recipe.recipeId?.departmentId ? (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#667eea', 
                        background: '#e8ecff', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontWeight: '600' 
                      }}>
                        {recipe.recipeId.departmentId.name} ({recipe.recipeId.departmentId.code})
                      </span>
                    ) : (
                      <span style={{ color: '#ff4757', fontSize: '12px' }}>No Department</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {recipe.ingredients?.map((ing, idx) => {
                        const wasRestocked = recipe.restockedIngredients?.includes(ing.inventoryId?.toString() || ing.inventoryId);
                        return (
                          <span key={idx} style={{ 
                            fontSize: '11px', 
                            color: wasRestocked ? '#00b894' : '#636e72',
                            background: wasRestocked ? '#e8f5e9' : '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            border: wasRestocked ? '1px solid #00b894' : '1px solid #e9ecef'
                          }}>
                            {wasRestocked && '✓ '}{ing.name || 'Unknown'}: {ing.quantity}{ing.unit}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#00b894', background: '#e8f5e9', padding: '6px 12px', borderRadius: '12px', fontWeight: '600' }}>
                      {recipe.restockedIngredients?.length || 0} items
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {recipe.createdAt && (() => {
                      const date = new Date(recipe.createdAt);
                      const dateStr = date.toLocaleDateString('en-GB');
                      const timeStr = date.toLocaleTimeString('en-US', { hour12: true });
                      return `${dateStr}, ${timeStr}`;
                    })()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {canDelete(userRole, 'semi-finished') && (
                      <button onClick={() => deleteRecipe(recipe._id)} style={{ padding: '8px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdDelete style={{ fontSize: '16px' }} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}

        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><BiError /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              {filterType === 'all' ? 'No cancelled recipes' : 'No cancelled recipes found for selected period'}
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              {filterType === 'all' ? 'Cancelled recipes will appear here' : 'Try adjusting your date filter'}
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default SemiFinished;
