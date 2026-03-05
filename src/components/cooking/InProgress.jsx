import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const InProgress = () => {
  const [cookingItems, setCookingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientQuantities, setIngredientQuantities] = useState({});

  useEffect(() => {
    fetchCookingItems();
  }, []);

  const fetchCookingItems = async () => {
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
      console.log('All cooking items:', data);
      const cookingItems = data.filter(item => item.status === 'cooking');
      console.log('Cooking items:', cookingItems);
      setCookingItems(cookingItems);
    } catch (error) {
      console.error('Error:', error);
      setCookingItems([]);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/cooked-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: status === 'finished' ? 'finished' : 'semi-finished' })
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to update status'}`);
        return;
      }
      
      fetchCookingItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const openRestockModal = (item) => {
    setSelectedItem(item);
    // Extract only the inventoryId strings, not the whole ingredient object
    const ingredientIds = item.ingredients.map(ing => 
      typeof ing.inventoryId === 'string' ? ing.inventoryId : ing.inventoryId._id || ing.inventoryId.toString()
    );
    setSelectedIngredients(ingredientIds);
    
    // Initialize quantities with original amounts
    const quantities = {};
    item.ingredients.forEach(ing => {
      const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
      quantities[ingId] = ing.quantity;
    });
    setIngredientQuantities(quantities);
    
    setShowRestockModal(true);
  };

  const confirmSemiFinished = async () => {
    if (selectedIngredients.length === 0) {
      alert('Please select at least one ingredient to restock');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/cooked-items/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'semi-finished',
          restockedIngredients: selectedIngredients,
          ingredientQuantities: ingredientQuantities
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to update status'}`);
        return;
      }
      
      setShowRestockModal(false);
      setSelectedItem(null);
      setSelectedIngredients([]);
      setIngredientQuantities({});
      fetchCookingItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
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
            <GiCookingPot style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Cooking
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Items currently being cooked</p>}
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
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cookingItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>{item.title}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#ffa502', background: '#fff3e0', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>x{item.quantity}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.ingredients?.map((ing, idx) => (
                        <span key={idx} style={{ fontSize: '11px', color: '#636e72', background: '#f8f9fa', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          {ing.name || 'Unknown'}: {ing.quantity}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {item.createdAt && new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateStatus(item._id, 'finished')} style={{ padding: '8px 12px', background: '#00b894', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        Finished
                      </button>
                      <button onClick={() => openRestockModal(item)} style={{ padding: '8px 12px', background: '#ffa502', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        Semi-Finished
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cookingItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><GiCookingPot /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No items cooking</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Go to Recipes page to start cooking!</p>
          </motion.div>
        )}
        </>
        )}
      </div>

      {showRestockModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Select Ingredients to Restock
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which ingredients to restock to inventory and adjust quantities:
            </p>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {selectedItem.ingredients?.map((ing, idx) => {
                const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                return (
                  <div key={idx} className="card bg-base-200 p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedIngredients.includes(ingId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIngredients([...selectedIngredients, ingId]);
                          } else {
                            setSelectedIngredients(selectedIngredients.filter(id => id !== ingId));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-base">
                          {ing.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Quantity</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-20"
                          value={ingredientQuantities[ingId] || ing.quantity}
                          onChange={(e) => {
                            setIngredientQuantities({
                              ...ingredientQuantities,
                              [ingId]: parseFloat(e.target.value) || 0
                            });
                          }}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium min-w-[3rem]">
                        {ing.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowRestockModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={confirmSemiFinished}
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InProgress;
