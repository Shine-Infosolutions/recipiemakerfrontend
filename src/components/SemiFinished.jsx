import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdDelete } from 'react-icons/md';
import { BiError } from 'react-icons/bi';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const SemiFinished = () => {
  const [cancelledRecipes, setCancelledRecipes] = useState([]);

  useEffect(() => {
    fetchCancelledRecipes();
  }, []);

  const fetchCancelledRecipes = async () => {
    const res = await fetch(`${API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setCancelledRecipes(data.filter(recipe => recipe.status === 'cancelled'));
  };

  const deleteRecipe = async (id) => {
    await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCancelledRecipes();
  };

  return (
    <>
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: window.innerWidth < 768 ? 0 : '250px',
        right: 0,
        background: '#f8f9fa',
        zIndex: 10,
        padding: window.innerWidth < 768 ? '12px 15px' : '16px 30px',
        borderBottom: '2px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BiError style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Semi-Finished</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Cancelled recipes with restocked ingredients</p>}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: window.innerWidth < 768 ? '70px' : '90px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 130px)' : 'calc(100vh - 90px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cancelledRecipes.map((recipe) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #ffcccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, color: '#2d3436', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdRestaurant style={{ fontSize: '18px', color: '#ff4757' }} /> {recipe.title}
                  </h3>
                  <span style={{ 
                    fontSize: '11px', 
                    color: 'white', 
                    background: '#ff4757', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontWeight: '600' 
                  }}>
                    Cancelled
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {recipe.ingredients?.map((ing, idx) => (
                    <span key={idx} style={{ fontSize: '12px', color: '#636e72', background: '#fff5f5', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}>
                      {ing.inventoryId?.name || 'Unknown'} - {ing.quantity} {ing.unit}
                    </span>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#ff4757', fontWeight: '600' }}>
                  ✓ Ingredients restocked to inventory
                </p>
                {recipe.createdAt && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#95a5a6', fontWeight: '500' }}>
                    Cancelled: {new Date(recipe.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => deleteRecipe(recipe._id)}
                  style={{
                    padding: '8px 12px',
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <MdDelete style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
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
      </div>
    </>
  );
};

export default SemiFinished;
