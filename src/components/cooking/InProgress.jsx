import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';
import Modal from '../common/Modal';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const InProgress = () => {
  const [cookingItems, setCookingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

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
          restockedIngredients: selectedIngredients
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

      <Modal isOpen={showRestockModal} onClose={() => setShowRestockModal(false)} title="Select Ingredients to Restock">
        {selectedItem && (
          <div>
            <p style={{ fontSize: '14px', color: '#636e72', marginBottom: '16px' }}>Select which ingredients to restock to inventory:</p>
            <div style={{ marginBottom: '20px' }}>
              {selectedItem.ingredients?.map((ing, idx) => {
                const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                return (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ingId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIngredients([...selectedIngredients, ingId]);
                      } else {
                        setSelectedIngredients(selectedIngredients.filter(id => id !== ingId));
                      }
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', flex: 1 }}>
                    {ing.name || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#636e72', fontWeight: '600' }}>
                    {ing.quantity} {ing.unit}
                  </span>
                </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmSemiFinished}
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

export default InProgress;
