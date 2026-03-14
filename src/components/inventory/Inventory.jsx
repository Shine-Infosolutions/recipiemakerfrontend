import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdKitchen, MdEdit, MdDelete, MdRestaurantMenu } from 'react-icons/md';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', productCode: '', quantity: '', unit: '', category: '', price: '', minStock: '', supplier: '', departmentId: '' });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchItems();
    fetchDepartments();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (userRole === 'Admin') {
      // Admin can filter by department or see all
      if (selectedDepartment) {
        setFilteredItems(items.filter(item => item.departmentId?._id === selectedDepartment));
      } else {
        setFilteredItems(items);
      }
    } else {
      // Non-admin users see only their department's items
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.departmentId) {
            setFilteredItems(items.filter(item => item.departmentId?._id === payload.departmentId));
          } else {
            setFilteredItems(items);
          }
        } catch (error) {
          setFilteredItems(items);
        }
      } else {
        setFilteredItems(items);
      }
    }
  }, [items, selectedDepartment, userRole]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched departments for inventory:', data);
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch inventory');
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setItems([]);
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (formData.name && formData.quantity && formData.unit && formData.departmentId) {
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
      setFormData({ name: '', productCode: '', quantity: '', unit: '', category: '', price: '', minStock: '', supplier: '', departmentId: '' });
      setEditingId(null);
      setShowForm(false);
      fetchItems();
      toast.success(editingId ? 'Item updated successfully!' : 'Item added successfully!');
    } else {
      toast.error('Please fill in all required fields including department!');
    }
  };

  const deleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchItems();
      toast.success('Item deleted successfully!');
    }
  };

  const editItem = (item) => {
    setFormData({
      name: item.name,
      productCode: item.productCode || '',
      quantity: item.quantity,
      unit: item.unit,
      category: item.category || '',
      price: item.price || '',
      minStock: item.minStock || '',
      supplier: item.supplier || '',
      departmentId: item.departmentId?._id || item.departmentId || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  return (
    <>
      <div style={{ 
        marginTop: window.innerWidth < 768 ? '0px' : '0px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdKitchen style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Raw Materials
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Manage your raw materials</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {userRole === 'Admin' && (
              <select
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minWidth: '150px',
                  color: '#2d3436'
                }}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ name: '', productCode: '', quantity: '', unit: '', category: '', price: '', minStock: '', supplier: '', departmentId: '' });
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
                whiteSpace: 'nowrap'
              }}
            >
              + Add Item
            </motion.button>
          </div>
        </div>
        {loading ? <Loading /> : (
        <>
        {showForm && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">
                {editingId ? <><MdEdit className="inline mr-2" /> Edit Item</> : <>Add New Item</>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Department <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Product Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product code"
                    className="input input-bordered"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Item Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category"
                    className="input input-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Quantity <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    className="input input-bordered"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Unit <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter unit (kg, pcs, etc.)"
                    className="input input-bordered"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price (₹)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    className="input input-bordered"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Min Stock</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter minimum stock"
                    className="input input-bordered"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Supplier</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter supplier name"
                    className="input input-bordered"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', productCode: '', quantity: '', unit: '', category: '', price: '', minStock: '', supplier: '', departmentId: '' });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={addItem}
                >
                  {editingId ? 'Update' : 'Add'} Item
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table w-full">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436' }}>Department</th>
                <th style={{ color: '#2d3436' }}>Product Code</th>
                <th style={{ color: '#2d3436' }}>Name</th>
                <th style={{ color: '#2d3436' }}>Category</th>
                <th style={{ color: '#2d3436' }}>Quantity</th>
                <th style={{ color: '#2d3436' }}>Unit</th>
                <th style={{ color: '#2d3436' }}>Price</th>
                <th style={{ color: '#2d3436' }}>Min Stock</th>
                <th style={{ color: '#2d3436' }}>Supplier</th>
                <th style={{ color: '#2d3436', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredItems) && filteredItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td>
                    <span className="badge badge-secondary badge-sm">
                      {item.departmentId?.name || 'No Department'}
                    </span>
                  </td>
                  <td style={{ color: '#2d3436' }}>{item.productCode || '-'}</td>
                  <td className="font-semibold" style={{ color: '#2d3436' }}>{item.name}</td>
                  <td>
                    {item.category && (
                      <span className="badge badge-primary badge-sm">{item.category}</span>
                    )}
                  </td>
                  <td className="font-bold" style={{ color: '#2d3436' }}>{item.quantity}</td>
                  <td style={{ color: '#2d3436' }}>{item.unit}</td>
                  <td style={{ color: '#2d3436' }}>{item.price > 0 ? `₹${item.price}` : '-'}</td>
                  <td style={{ color: '#2d3436' }}>{item.minStock || '-'}</td>
                  <td style={{ color: '#2d3436' }}>{item.supplier || '-'}</td>
                  <td>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => editItem(item)} className="btn btn-sm btn-primary">
                        <MdEdit className="text-base" /> Edit
                      </button>
                      <button onClick={() => deleteItem(item._id)} className="btn btn-sm btn-error">
                        <MdDelete className="text-base" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Array.isArray(filteredItems) && filteredItems.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdKitchen /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              {selectedDepartment ? 'No items found for selected department' : 'Your raw materials list is empty'}
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              {selectedDepartment ? 'Try selecting a different department or add new items.' : 'Click "Add Item" to start managing your raw materials!'}
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default Inventory;
