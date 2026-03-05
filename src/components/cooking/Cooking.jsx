import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdDelete } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Cooking = () => {
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCookedRecipes();
  }, []);

  const fetchCookedRecipes = async () => {
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
      setCookedRecipes(data.filter(item => item.status === 'finished'));
    } catch (error) {
      console.error('Error:', error);
      setCookedRecipes([]);
    }
    setLoading(false);
  };

  const filterRecipes = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return cookedRecipes.filter(recipe => {
      if (!recipe.createdAt) return false;
      const recipeDate = new Date(recipe.createdAt);
      
      if (filterType === 'today') {
        return recipeDate >= today;
      } else if (filterType === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return recipeDate >= start && recipeDate <= end;
      }
      return true;
    });
  };

  const deleteRecipe = async (id) => {
    await fetch(`${API_URL}/finished-goods/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCookedRecipes();
  };

  const filteredRecipes = filterRecipes();

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
            <GiCookingPot style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Finished Goods
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>View your finished goods</p>}
        </div>
        {loading ? <Loading /> : (
        <>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Quantity</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe) => (
                <tr key={recipe._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>{recipe.title}</td>
                  <td style={{ padding: '16px' }}>
                    {recipe.quantity > 1 && (
                      <span style={{ fontSize: '11px', color: '#00b894', background: '#e8f5e9', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>x{recipe.quantity}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {recipe.ingredients?.map((ing, idx) => (
                        <span key={idx} style={{ fontSize: '11px', color: '#636e72', background: '#f8f9fa', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          {ing.name || 'Unknown'}: {ing.quantity}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {recipe.createdAt && new Date(recipe.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><GiCookingPot /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No finished goods yet</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Go to Cooking page to finish items!</p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default Cooking;
