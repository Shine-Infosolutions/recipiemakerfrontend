import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdDelete } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Cooking = () => {
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCookedRecipes();
  }, []);

  const fetchCookedRecipes = async () => {
    const res = await fetch(`${API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setCookedRecipes(data);
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
    await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCookedRecipes();
  };

  const updateRecipeStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchCookedRecipes();
    }
  };

  const cancelRecipe = async (recipe) => {
    if (!window.confirm('Cancel this recipe? Ingredients will be restocked to inventory.')) return;
    
    // Restock ingredients
    for (const ing of recipe.ingredients) {
      if (ing.inventoryId && ing.inventoryId._id) {
        await fetch(`${API_URL}/inventory/${ing.inventoryId._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: ing.inventoryId.name,
            quantity: (ing.inventoryId.quantity || 0) + ing.quantity,
            unit: ing.inventoryId.unit,
            category: ing.inventoryId.category,
            price: ing.inventoryId.price
          })
        });
      }
    }
    
    // Update status to cancelled
    await updateRecipeStatus(recipe._id, 'cancelled');
    alert('Recipe cancelled and ingredients restocked!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'cooking': return '#ffa502';
      case 'cooked': return '#00b894';
      case 'cancelled': return '#ff4757';
      default: return '#ffa502';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'cooking': return 'Cooking';
      case 'cooked': return 'Cooked';
      case 'cancelled': return 'Cancelled (Semi-finished)';
      default: return 'Cooking';
    }
  };

  const filteredRecipes = filterRecipes();

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GiCookingPot style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cooking History</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>View your cooked recipes</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #dfe6e9',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="range">Date Range</option>
            </select>
            {filterType === 'range' && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <span style={{ color: '#636e72', fontSize: '13px' }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </>
            )}
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
          {filteredRecipes.map((recipe) => (
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
                border: '1px solid #e9ecef',
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
                    <MdRestaurant style={{ fontSize: '18px', color: '#667eea' }} /> {recipe.title}
                  </h3>
                  {recipe.quantity > 1 && (
                    <span style={{ fontSize: '11px', color: '#667eea', background: '#f0f3ff', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
                      x{recipe.quantity}
                    </span>
                  )}
                  <span style={{ 
                    fontSize: '11px', 
                    color: 'white', 
                    background: getStatusColor(recipe.status || 'cooking'), 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontWeight: '600' 
                  }}>
                    {getStatusLabel(recipe.status || 'cooking')}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {recipe.ingredients?.map((ing, idx) => (
                    <span key={idx} style={{ fontSize: '12px', color: '#636e72', background: '#f8f9fa', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}>
                      {ing.inventoryId?.name || 'Unknown'} - {ing.quantity} {ing.unit}
                    </span>
                  ))}
                </div>
                {recipe.createdAt && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#95a5a6', fontWeight: '500' }}>
                    Cooked: {new Date(recipe.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(!recipe.status || recipe.status === 'cooking') && (
                  <>
                    <button
                      onClick={() => updateRecipeStatus(recipe._id, 'cooked')}
                      style={{
                        padding: '8px 12px',
                        background: '#00b894',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Mark Cooked
                    </button>
                    <button
                      onClick={() => cancelRecipe(recipe)}
                      style={{
                        padding: '8px 12px',
                        background: '#ffa502',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {recipe.status === 'cooked' && (
                  <button
                    onClick={() => updateRecipeStatus(recipe._id, 'cooking')}
                    style={{
                      padding: '8px 12px',
                      background: '#ffa502',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Mark Cooking
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><GiCookingPot /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No cooked recipes yet</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Go to Recipes page to cook your first recipe!</p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Cooking;
