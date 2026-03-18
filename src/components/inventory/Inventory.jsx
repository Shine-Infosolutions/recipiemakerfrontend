import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdKitchen, MdEdit, MdDelete, MdRestaurantMenu, MdMoreVert, MdTransferWithinAStation } from 'react-icons/md';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import PermissionWrapper from '../common/PermissionWrapper';
import TransferModal from './TransferModal';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useUser } from '../../contexts/UserContext';
import { canDelete, canCreate, canEdit, canViewAllDepartments } from '../../utils/permissions';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const { departments } = useDepartments();
  const { user } = useUser();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', productCode: '', quantity: '', unit: '', category: '', price: '', minStock: '', supplier: '', departmentId: '' });
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItemForTransfer, setSelectedItemForTransfer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const userRole = user?.role || 'store';

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.three-dots-menu')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (canViewAllDepartments(userRole)) {
      // Admin and manager can filter by department or see all
      if (selectedDepartment) {
        setFilteredItems(items.filter(item => item.departmentId?._id === selectedDepartment));
      } else {
        setFilteredItems(items);
      }
    } else {
      // Other users see only their department's items
      if (user?.departmentId) {
        const userDeptId = user.departmentId._id || user.departmentId;
        const filtered = items.filter(item => {
          const itemDeptId = item.departmentId?._id || item.departmentId;
          return itemDeptId && userDeptId && itemDeptId.toString() === userDeptId.toString();
        });
        setFilteredItems(filtered);
      } else {
        // If user has no department, show all items
        setFilteredItems(items);
      }
    }
  }, [items, selectedDepartment, userRole, user]);

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



  const handleThreeDotsClick = (event, itemId) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 140
    });
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const openTransferModal = (item) => {
    setSelectedItemForTransfer(item);
    setShowTransferModal(true);
    setActiveDropdown(null);
  };

  const handleTransferSuccess = (transfer) => {
    fetchItems(); // Refresh the inventory list
  };

  // Pagination logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, filteredItems.length]);

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
            {canViewAllDepartments(userRole) && (
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
            {canCreate(userRole, 'inventory') && (
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
            )}
          </div>
        </div>
        {loading ? <Loading /> : (
        <>
        {/* Stock Status Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ 
              fontSize: '24px', 
              color: '#00b894',
              background: '#00b89415',
              padding: '8px',
              borderRadius: '8px'
            }}>
              ✓
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#636e72', fontWeight: '600', textTransform: 'uppercase' }}>In Stock</p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#2d3436', fontWeight: '700' }}>
                {filteredItems.filter(item => item.quantity > (item.minStock || 10)).length}
              </h3>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ 
              fontSize: '24px', 
              color: '#ffa502',
              background: '#ffa50215',
              padding: '8px',
              borderRadius: '8px'
            }}>
              ⚠️
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#636e72', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock</p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#2d3436', fontWeight: '700' }}>
                {filteredItems.filter(item => item.quantity > 0 && item.quantity <= (item.minStock || 10)).length}
              </h3>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ 
              fontSize: '24px', 
              color: '#ff4757',
              background: '#ff475715',
              padding: '8px',
              borderRadius: '8px'
            }}>
              ❌
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#636e72', fontWeight: '600', textTransform: 'uppercase' }}>Out of Stock</p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#2d3436', fontWeight: '700' }}>
                {filteredItems.filter(item => item.quantity === 0).length}
              </h3>
            </div>
          </motion.div>
        </div>
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

        {/* Transfer Modal */}
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedItemForTransfer(null);
          }}
          item={selectedItemForTransfer}
          departments={departments}
          onTransferSuccess={handleTransferSuccess}
        />

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto" style={{ position: 'relative' }}>
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
                <th style={{ color: '#2d3436', textAlign: 'center', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentItems) && currentItems.map((item) => (
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
                  <td className="font-bold" style={{ color: '#2d3436', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.quantity}</span>
                      {item.quantity === 0 && (
                        <span className="badge badge-error badge-xs" style={{ fontSize: '10px', padding: '2px 6px' }}>OUT OF STOCK</span>
                      )}
                      {item.quantity > 0 && item.quantity <= (item.minStock || 10) && (
                        <span className="badge badge-warning badge-xs" style={{ fontSize: '10px', padding: '2px 6px' }}>LOW STOCK</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#2d3436' }}>{item.unit}</td>
                  <td style={{ color: '#2d3436' }}>{item.price > 0 ? `₹${item.price}` : '-'}</td>
                  <td style={{ color: '#2d3436' }}>{item.minStock || '-'}</td>
                  <td style={{ color: '#2d3436' }}>{item.supplier || '-'}</td>
                  <td style={{ width: '60px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => handleThreeDotsClick(e, item._id)}
                      className="btn btn-sm btn-ghost hover:bg-gray-100 three-dots-menu"
                      style={{ padding: '4px 8px', color: '#2d3436' }}
                    >
                      <MdMoreVert className="text-lg text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}

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

        {/* Floating Three Dots Menu */}
        {activeDropdown && (
          <>
            <div 
              className="fixed inset-0" 
              style={{ zIndex: 998 }}
              onClick={() => setActiveDropdown(null)}
            ></div>
            <div 
              className="fixed bg-white border border-gray-200 rounded-lg shadow-xl three-dots-menu"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 999,
                minWidth: '160px',
                whiteSpace: 'nowrap'
              }}
            >
              {canEdit(userRole, 'inventory') && (
                <button
                  onClick={() => {
                    const item = filteredItems.find(i => i._id === activeDropdown);
                    editItem(item);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 text-left rounded-t-lg"
                >
                  <MdEdit className="text-blue-500 text-base" /> Edit Item
                </button>
              )}
              <button
                onClick={() => {
                  const item = filteredItems.find(i => i._id === activeDropdown);
                  openTransferModal(item);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 text-left"
              >
                <MdTransferWithinAStation className="text-green-500 text-base" /> Transfer Item
              </button>
              {canDelete(userRole, 'inventory') && (
                <button
                  onClick={() => {
                    deleteItem(activeDropdown);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left rounded-b-lg"
                >
                  <MdDelete className="text-red-500 text-base" /> Delete Item
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Inventory;
