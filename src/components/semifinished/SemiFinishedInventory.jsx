import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdKitchen, MdEdit, MdDelete, MdMoreVert, MdAdd } from 'react-icons/md';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import CreateSemiFinished from './CreateSemiFinished';
import AddSemiFinishedStock from './AddSemiFinishedStock';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useUser } from '../../contexts/UserContext';
import { canDelete, canCreate, canEdit, canViewAllDepartments } from '../../utils/permissions';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const SemiFinishedInventory = () => {
  const [semiFinishedItems, setSemiFinishedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const { departments } = useDepartments();
  const { user } = useUser();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const userRole = user?.role || 'store';

  useEffect(() => {
    fetchSemiFinishedItems();
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
      if (selectedDepartment) {
        setFilteredItems(semiFinishedItems.filter(item => item.departmentId?._id === selectedDepartment));
      } else {
        setFilteredItems(semiFinishedItems);
      }
    } else {
      if (user?.departmentId) {
        const userDeptId = user.departmentId._id || user.departmentId;
        const filtered = semiFinishedItems.filter(item => {
          const itemDeptId = item.departmentId?._id || item.departmentId;
          return itemDeptId && userDeptId && itemDeptId.toString() === userDeptId.toString();
        });
        setFilteredItems(filtered);
      } else {
        setFilteredItems(semiFinishedItems);
      }
    }
  }, [semiFinishedItems, selectedDepartment, userRole, user]);

  const fetchSemiFinishedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/semi-finished`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSemiFinishedItems(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch semi-finished items');
        setSemiFinishedItems([]);
      }
    } catch (error) {
      console.error('Error fetching semi-finished items:', error);
      setSemiFinishedItems([]);
    }
    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this semi-finished item?')) {
      try {
        await fetch(`${API_URL}/semi-finished/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchSemiFinishedItems();
        toast.success('Semi-finished item deleted successfully!');
      } catch (error) {
        toast.error('Error deleting item');
      }
    }
  };

  const openAddStockModal = (item) => {
    setSelectedItemForStock(item);
    setShowAddStockModal(true);
    setActiveDropdown(null);
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

  // Pagination logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
              <MdKitchen style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Semi-Finished Items
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Manage your semi-finished inventory</p>}
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
            {canCreate(userRole, 'semi-finished') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
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
                + Create Semi-Finished
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
                {filteredItems.filter(item => item.quantity > 0).length}
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
              color: '#667eea',
              background: '#667eea15',
              padding: '8px',
              borderRadius: '8px'
            }}>
              📦
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#636e72', fontWeight: '600', textTransform: 'uppercase' }}>Total Items</p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#2d3436', fontWeight: '700' }}>
                {filteredItems.length}
              </h3>
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto" style={{ position: 'relative' }}>
            <table className="table w-full">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436' }}>Department</th>
                <th style={{ color: '#2d3436' }}>Name</th>
                <th style={{ color: '#2d3436' }}>Raw Materials Used</th>
                <th style={{ color: '#2d3436' }}>Current Stock</th>
                <th style={{ color: '#2d3436' }}>Created Date</th>
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
                  <td className="font-semibold" style={{ color: '#2d3436' }}>{item.name}</td>
                  <td style={{ fontSize: '12px', color: '#636e72' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.rawMaterials?.map((rm, idx) => (
                        <span key={idx} style={{ 
                          background: '#e8f5e9', 
                          color: '#2e7d32',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          {rm.inventoryId?.name || 'Unknown'}: {rm.quantity}{rm.unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="font-bold" style={{ color: '#2d3436', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.quantity || 0}</span>
                      {item.quantity === 0 && (
                        <span className="badge badge-error badge-xs" style={{ fontSize: '10px', padding: '2px 6px' }}>OUT OF STOCK</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#636e72', fontSize: '12px' }}>
                    {item.createdAt && new Date(item.createdAt).toLocaleDateString('en-GB')}
                  </td>
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

        {Array.isArray(filteredItems) && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdKitchen /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              {selectedDepartment ? 'No semi-finished items found for selected department' : 'No semi-finished items yet'}
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              {selectedDepartment ? 'Try selecting a different department or create new items.' : 'Click "Create Semi-Finished" to start creating processed ingredients!'}
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
              <button
                onClick={() => {
                  const item = filteredItems.find(i => i._id === activeDropdown);
                  openAddStockModal(item);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 text-left rounded-t-lg"
              >
                <MdAdd className="text-green-500 text-base" /> Add Stock
              </button>
              {canDelete(userRole, 'semi-finished') && (
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

      {/* Create Semi-Finished Modal */}
      <CreateSemiFinished
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchSemiFinishedItems}
      />

      {/* Add Stock Modal */}
      <AddSemiFinishedStock
        isOpen={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false);
          setSelectedItemForStock(null);
        }}
        onSuccess={fetchSemiFinishedItems}
        semiFinishedItem={selectedItemForStock}
      />
    </>
  );
};

export default SemiFinishedInventory;