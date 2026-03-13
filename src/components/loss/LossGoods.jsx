import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdError, MdDelete, MdRestaurantMenu, MdAdd, MdCalendarToday } from 'react-icons/md';
import { BiError } from 'react-icons/bi';
import Loading from '../common/Loading';
import ManualLossForm from './ManualLossForm';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const LossGoods = () => {
  const [lossItems, setLossItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'User');
  const [showManualForm, setShowManualForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLossItems();
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch recipes');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    }
  };

  const fetchLossItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/losses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch loss items');
        setLossItems([]);
        return;
      }
      
      const data = await res.json();
      setLossItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setLossItems([]);
    }
    setLoading(false);
  };

  const deleteLossItem = async (id) => {
    if (confirm('Are you sure you want to delete this loss record?')) {
      try {
        const res = await fetch(`${API_URL}/losses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
          fetchLossItems();
          toast.success('Loss record deleted successfully!');
        } else {
          toast.error('Failed to delete loss record');
        }
      } catch (error) {
        toast.error('Error deleting loss record: ' + error.message);
      }
    }
  };

  const calculateLossValue = (item) => {
    return item.lossValue || 0;
  };

  const filterLossItems = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return lossItems.filter(item => {
      if (!item.lossDate) return false;
      const itemDate = new Date(item.lossDate);
      
      if (filterType === 'today') {
        return itemDate >= today;
      } else if (filterType === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return itemDate >= start && itemDate <= end;
      }
      return true;
    });
  };

  const filteredLossItems = filterLossItems();
  const totalLossValue = filteredLossItems.reduce((sum, item) => sum + calculateLossValue(item), 0);

  return (
    <>
      <div style={{ 
        marginTop: window.innerWidth < 768 ? '0px' : '0px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdError style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#ff4757', flexShrink: 0 }} /> Loss Goods
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Items marked as loss during cooking</p>}
          
          {/* Loss Summary */}
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
            border: '1px solid #e9ecef',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#636e72', fontWeight: '600' }}>Total Loss Items</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#ff4757', fontWeight: '700' }}>{filteredLossItems.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#636e72', fontWeight: '600' }}>Total Loss Value</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#ff4757', fontWeight: '700' }}>₹{totalLossValue.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setShowManualForm(true)}
              style={{ 
                padding: '12px 16px', 
                background: '#ff4757', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <MdAdd style={{ fontSize: '18px' }} /> Add Manual Loss
            </button>
          </div>
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
                    placeholder="dd-mm-yyyy"
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
                    placeholder="dd-mm-yyyy"
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
                <th style={{ color: '#2d3436', padding: '16px' }}>Quantity</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Loss Value</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                {userRole === 'Admin' && (
                  <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLossItems.map((item) => {
                const lossValue = calculateLossValue(item);
                return (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef', borderLeft: '3px solid #ff4757' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdRestaurantMenu style={{ fontSize: '18px', color: '#ff4757' }} />
                      <div>
                        <div>{item.recipeTitle}</div>
                        <div style={{ fontSize: '11px', color: '#636e72', marginTop: '2px' }}>
                          {item.lossType} - {item.lossReason}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#ff4757', background: '#fff5f5', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>x{item.originalQuantity}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#ff4757', fontWeight: '600' }}>₹{lossValue.toFixed(2)}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.ingredients?.map((ing, idx) => (
                        <span key={idx} style={{ 
                          fontSize: '11px', 
                          color: ing.lostQuantity > 0 ? '#ff4757' : '#636e72', 
                          background: ing.lostQuantity > 0 ? '#fff5f5' : '#f8f9fa', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontWeight: '600',
                          border: ing.lostQuantity > 0 ? '1px solid #ff4757' : '1px solid #e9ecef'
                        }}>
                          {ing.lostQuantity > 0 && '❌ '}{ing.name || 'Unknown'}: {ing.lostQuantity > 0 ? ing.lostQuantity : ing.quantity}{ing.unit}
                        </span>
                      ))}}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {item.lossDate && (() => {
                      const date = new Date(item.lossDate);
                      const dateStr = date.toLocaleDateString('en-GB');
                      const timeStr = date.toLocaleTimeString('en-US', { hour12: true });
                      return `${dateStr}, ${timeStr}`;
                    })()}
                  </td>
                  {userRole === 'Admin' && (
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => deleteLossItem(item._id)} 
                        style={{ 
                          padding: '8px 12px', 
                          background: '#ff4757', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontWeight: '600', 
                          fontSize: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px' 
                        }}
                      >
                        <MdDelete style={{ fontSize: '16px' }} /> Delete
                      </button>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLossItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#ff4757', display: 'flex', justifyContent: 'center' }}><BiError /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              {filterType === 'all' ? 'No loss records' : 'No loss records found for selected period'}
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              {filterType === 'all' ? 'Items marked as loss will appear here' : 'Try adjusting your date filter'}
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>
      
      <ManualLossForm 
        isOpen={showManualForm}
        onClose={() => setShowManualForm(false)}
        onSuccess={fetchLossItems}
      />
    </>
  );
};

export default LossGoods;