import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdDelete } from 'react-icons/md';
import { BiError } from 'react-icons/bi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const SemiFinished = () => {
  const [cancelledRecipes, setCancelledRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCancelledRecipes();
  }, []);

  const fetchCancelledRecipes = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_URL}/cooked-items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Failed to fetch');
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
            <BiError style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Semi-Finished
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Cancelled recipes with restocked ingredients</p>}
        </div>
        {loading ? <Loading /> : (
        <>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Restocked</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelledRecipes.map((recipe) => (
                <tr key={recipe._id} style={{ borderBottom: '1px solid #e9ecef', borderLeft: '3px solid #ffa502' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>{recipe.title}</td>
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
                    {recipe.createdAt && new Date(recipe.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => deleteRecipe(recipe._id)} style={{ padding: '8px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MdDelete style={{ fontSize: '16px' }} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cancelledRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><BiError /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No cancelled recipes</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Cancelled recipes will appear here</p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default SemiFinished;
