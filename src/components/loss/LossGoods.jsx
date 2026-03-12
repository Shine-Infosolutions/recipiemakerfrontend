import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdError, MdDelete, MdRestaurantMenu } from 'react-icons/md';
import { BiError } from 'react-icons/bi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const LossGoods = () => {
  const [lossItems, setLossItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'User');

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

  const totalLossValue = lossItems.reduce((sum, item) => sum + calculateLossValue(item), 0);

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
              <p style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#ff4757', fontWeight: '700' }}>{lossItems.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#636e72', fontWeight: '600' }}>Total Loss Value</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#ff4757', fontWeight: '700' }}>₹{totalLossValue.toFixed(2)}</p>
            </div>
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
              {lossItems.map((item) => {
                const lossValue = calculateLossValue(item);
                return (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef', borderLeft: '3px solid #ff4757' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdRestaurantMenu style={{ fontSize: '18px', color: '#ff4757' }} />
                      <div>
                        <div>{item.recipeTitle}</div>
                        <div style={{ fontSize: '11px', color: '#636e72', marginTop: '2px' }}>
                          {item.lossType === 'complete' ? 'Complete Loss' : 'Partial Loss'} - {item.lossReason}
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
                          color: ing.isLost ? '#ff4757' : '#636e72', 
                          background: ing.isLost ? '#fff5f5' : '#f8f9fa', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontWeight: '600',
                          border: ing.isLost ? '1px solid #ff4757' : '1px solid #e9ecef'
                        }}>
                          {ing.isLost && '❌ '}{ing.name || 'Unknown'}: {ing.isLost ? ing.lostQuantity : ing.quantity}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {item.lossDate && new Date(item.lossDate).toLocaleString()}
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

        {lossItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#ff4757', display: 'flex', justifyContent: 'center' }}><BiError /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No loss records</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Items marked as loss will appear here</p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default LossGoods;