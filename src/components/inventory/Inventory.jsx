import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdKitchen, MdEdit, MdDelete, MdRestaurantMenu } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', quantity: '', unit: '', category: '', price: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setItems(data);
  };

  const addItem = async () => {
    if (formData.name && formData.quantity && formData.unit) {
      const url = editingId ? `${API_URL}/inventory/${editingId}` : `${API_URL}/inventory`;
      const method = editingId ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      setFormData({ name: '', quantity: '', unit: '', category: '', price: '' });
      setEditingId(null);
      setShowForm(false);
      fetchItems();
    }
  };

  const deleteItem = async (id) => {
    await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchItems();
  };

  const editItem = (item) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category || '',
      price: item.price || ''
    });
    setEditingId(item._id);
    setShowForm(true);
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
              <MdKitchen style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Inventory</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Manage your kitchen ingredients</p>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', quantity: '', unit: '', category: '', price: '' });
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
            + Add Item
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
            <h3 style={{ marginTop: 0, color: '#2d3436', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{editingId ? <><MdEdit style={{ verticalAlign: 'middle' }} /> Edit Item</> : <>Add New Item</>}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Unit</option>
                <option value="PCS">PCS</option>
                <option value="KG">KG</option>
                <option value="Gram">Gram</option>
                <option value="Liter">Liter</option>
                <option value="Pack">Pack</option>
                <option value="Dozen">Dozen</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Category</option>
                <option value="Dairy">Dairy</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Meat">Meat</option>
                <option value="Grains">Grains</option>
                <option value="Spices">Spices</option>
              </select>
            </div>
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
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', quantity: '', unit: '', category: '', price: '' });
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.12)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#2d3436', fontSize: '16px', fontWeight: '600' }}>{item.name}</h3>
                <p style={{ margin: '0 0 6px 0', color: '#636e72', fontSize: '14px', fontWeight: '500' }}>
                  {item.quantity} {item.unit} {item.price > 0 && `• ₹${item.price}`}
                </p>
                {item.category && <span style={{ fontSize: '11px', color: '#667eea', display: 'inline-block', background: '#f0f0ff', padding: '3px 10px', borderRadius: '10px', fontWeight: '600' }}><MdRestaurantMenu style={{ verticalAlign: 'middle' }} /> {item.category}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                <button
                  onClick={() => editItem(item)}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    flex: 1
                  }}
                >
                  <MdEdit style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> Edit
                </button>
                <button
                  onClick={() => deleteItem(item._id)}
                  style={{
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    flex: 1
                  }}
                >
                  <MdDelete style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {items.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdKitchen /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>Your inventory is empty</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Click "Add Item" to start managing your ingredients!</p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Inventory;
