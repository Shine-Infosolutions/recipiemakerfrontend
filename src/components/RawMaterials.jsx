import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdInventory, MdEdit, MdDelete, MdClose, MdAdd } from 'react-icons/md';
import { BiSolidError } from 'react-icons/bi';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const RawMaterials = () => {
  const [items, setItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ recipeName: '', variation: '', ingredients: [{ inventoryId: '', quantity: '' }] });

  useEffect(() => {
    fetchItems();
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await fetch(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setInventoryItems(data);
  };

  const fetchItems = async () => {
    const res = await fetch(`${API_URL}/rawmaterials`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setItems(data);
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { inventoryId: '', quantity: '' }] });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addItem = async () => {
    if (formData.recipeName && formData.ingredients.every(ing => ing.inventoryId && ing.quantity)) {
      const url = editingId ? `${API_URL}/rawmaterials/${editingId}` : `${API_URL}/rawmaterials`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || 'Failed to save recipe');
        return;
      }
      
      setFormData({ recipeName: '', variation: '', ingredients: [{ inventoryId: '', quantity: '' }] });
      setEditingId(null);
      setShowForm(false);
      fetchItems();
    }
  };

  const deleteItem = async (id) => {
    await fetch(`${API_URL}/rawmaterials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchItems();
  };

  const editItem = (item) => {
    setFormData({
      recipeName: item.recipeName,
      variation: item.variation || '',
      ingredients: item.ingredients.map(ing => ({
        inventoryId: ing.inventoryId._id,
        quantity: ing.quantity
      }))
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const isLowStock = (ingredient) => {
    const minStock = ingredient.inventoryId?.minStock || 10;
    return ingredient.inventoryId?.quantity <= minStock;
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
              <MdInventory style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Raw Materials</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Manage recipe templates</p>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ recipeName: '', variation: '', ingredients: [{ inventoryId: '', quantity: '' }] });
            }}
            style={{
              padding: window.innerWidth < 768 ? '8px 12px' : '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: window.innerWidth < 768 ? '12px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            + Add Recipe
          </motion.button>
        </div>
      </div>

      <div style={{ 
        marginTop: window.innerWidth < 768 ? '70px' : '90px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 130px)' : 'calc(100vh - 90px)'
      }}>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              marginBottom: '24px',
              border: '1px solid #e9ecef'
            }}
          >
            <h3 style={{ marginTop: 0, color: '#2d3436', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{editingId ? <><MdEdit style={{ verticalAlign: 'middle' }} /> Edit Recipe</> : <>Add New Recipe</>}</h3>
            <input
              type="text"
              placeholder="Recipe name"
              value={formData.recipeName}
              onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dfe6e9',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '10px'
              }}
            />
            <input
              type="text"
              placeholder="Variation (optional)"
              value={formData.variation}
              onChange={(e) => setFormData({ ...formData, variation: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dfe6e9',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '16px'
              }}
            />
            
            <h4 style={{ color: '#2d3436', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Ingredients:</h4>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                <select
                  value={ingredient.inventoryId}
                  onChange={(e) => updateIngredient(index, 'inventoryId', e.target.value)}
                  style={{
                    padding: '10px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Ingredient</option>
                  {inventoryItems.map(inv => (
                    <option key={inv._id} value={inv._id}>{inv.name} ({inv.quantity} {inv.unit})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  style={{
                    padding: '10px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    onClick={() => removeIngredient(index)}
                    style={{
                      padding: '10px',
                      background: '#ff4757',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={addIngredient}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                marginTop: '8px',
                marginBottom: '16px',
                fontSize: '13px'
              }}
            >
              <MdAdd /> Add Ingredient
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={addItem}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {editingId ? 'Update Recipe' : 'Save Recipe'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ recipeName: '', variation: '', ingredients: [{ inventoryId: '', quantity: '' }] });
                }}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Variation</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>{item.recipeName}</td>
                  <td style={{ padding: '16px' }}>
                    {item.variation && (
                      <span style={{ fontSize: '11px', color: '#667eea', background: '#e8eaf6', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>{item.variation}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.ingredients?.map((ing, idx) => (
                        <span key={idx} style={{ 
                          fontSize: '11px', 
                          color: isLowStock(ing) ? '#c62828' : '#636e72',
                          background: isLowStock(ing) ? '#ffebee' : '#f8f9fa',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isLowStock(ing) && <BiSolidError />}
                          {ing.inventoryId?.name}: {ing.quantity} {ing.inventoryId?.unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => editItem(item)} style={{ padding: '8px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdEdit style={{ fontSize: '16px' }} /> Edit
                      </button>
                      <button onClick={() => deleteItem(item._id)} style={{ padding: '8px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdDelete style={{ fontSize: '16px' }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdInventory /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No recipes yet</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Click "Add Recipe" to get started!</p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default RawMaterials;
