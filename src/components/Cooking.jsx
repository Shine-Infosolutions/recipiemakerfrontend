import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdDelete } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import Modal from './Modal';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Cooking = () => {
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

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
      // Only show cooking and cooked recipes, exclude cancelled
      if (recipe.status === 'cancelled') return false;
      
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
    setSelectedRecipe(recipe);
    setSelectedIngredients(recipe.ingredients.map(ing => ing.inventoryId._id));
    setShowRestockModal(true);
  };

  const confirmCancelRecipe = async () => {
    if (selectedIngredients.length === 0) {
      alert('Please select at least one ingredient to restock');
      return;
    }

    // Restock only selected ingredients
    for (const ing of selectedRecipe.ingredients) {
      if (ing.inventoryId && ing.inventoryId._id && selectedIngredients.includes(ing.inventoryId._id)) {
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
    
    // Update status to cancelled and save restocked ingredients
    await fetch(`${API_URL}/recipes/${selectedRecipe._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        status: 'cancelled',
        restockedIngredients: selectedIngredients
      })
    });
    
    setShowRestockModal(false);
    setSelectedRecipe(null);
    setSelectedIngredients([]);
    fetchCookedRecipes();
    alert('Recipe cancelled and selected ingredients restocked!');
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
      case 'cooking': return 'In Progress';
      case 'cooked': return 'Finished Goods';
      case 'cancelled': return 'Semi-Finished Goods';
      default: return 'In Progress';
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
              <GiCookingPot style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Finished Goods</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>View your finished goods</p>}
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
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Quantity</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Status</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
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
                          {ing.inventoryId?.name || 'Unknown'}: {ing.quantity}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: recipe.status === 'cooking' ? '#ffa502' : '#00b894',
                      background: recipe.status === 'cooking' ? '#fff3e0' : '#e8f5e9',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(recipe.status || 'cooking')}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {recipe.createdAt && new Date(recipe.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {(!recipe.status || recipe.status === 'cooking') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateRecipeStatus(recipe._id, 'cooked')} style={{ padding: '8px 12px', background: '#00b894', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          Finished
                        </button>
                        <button onClick={() => cancelRecipe(recipe)} style={{ padding: '8px 12px', background: '#ffa502', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          Semi-Finished
                        </button>
                      </div>
                    )}
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
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No cooked recipes yet</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Go to Recipes page to cook your first recipe!</p>
          </motion.div>
        )}
      </div>

      <Modal isOpen={showRestockModal} onClose={() => setShowRestockModal(false)} title="Select Ingredients to Restock">
        {selectedRecipe && (
          <div>
            <p style={{ fontSize: '14px', color: '#636e72', marginBottom: '16px' }}>Select which ingredients to restock to inventory:</p>
            <div style={{ marginBottom: '20px' }}>
              {selectedRecipe.ingredients?.map((ing, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ing.inventoryId._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIngredients([...selectedIngredients, ing.inventoryId._id]);
                      } else {
                        setSelectedIngredients(selectedIngredients.filter(id => id !== ing.inventoryId._id));
                      }
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', flex: 1 }}>
                    {ing.inventoryId?.name || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#636e72', fontWeight: '600' }}>
                    {ing.quantity} {ing.unit}
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmCancelRecipe}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #ffa502 0%, #ff8c00 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Confirm Restock
              </button>
              <button
                onClick={() => setShowRestockModal(false)}
                style={{
                  padding: '12px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Cooking;
