import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdKitchen, MdDelete, MdMoreVert, MdAdd } from 'react-icons/md';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import CreateSemiFinished from './CreateSemiFinished';
import AddSemiFinishedStock from './AddSemiFinishedStock';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useUser } from '../../contexts/UserContext';
import { canDelete, canCreate, canViewAllDepartments } from '../../utils/permissions';

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

  useEffect(() => { fetchSemiFinishedItems(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.three-dots-menu')) setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    if (canViewAllDepartments(userRole)) {
      setFilteredItems(selectedDepartment
        ? semiFinishedItems.filter(item => item.departmentId?._id === selectedDepartment)
        : semiFinishedItems);
    } else {
      if (user?.departmentId) {
        const userDeptId = user.departmentId._id || user.departmentId;
        setFilteredItems(semiFinishedItems.filter(item => {
          const itemDeptId = item.departmentId?._id || item.departmentId;
          return itemDeptId?.toString() === userDeptId.toString();
        }));
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
        setSemiFinishedItems([]);
      }
    } catch (error) {
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
    setDropdownPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX - 140 });
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [selectedDepartment, filteredItems.length]);

  return (
    <>
      <div style={{ padding: window.innerWidth < 768 ? '15px' : '30px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdKitchen style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Semi-Finished Items
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Manage your semi-finished inventory</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {canViewAllDepartments(userRole) && (
              <select
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', minWidth: '150px', color: '#2d3436' }}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            )}
            {canCreate(userRole, 'semi-finished') && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                style={{ padding: window.innerWidth < 768 ? '8px 12px' : '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: window.innerWidth < 768 ? '12px' : '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.3)', whiteSpace: 'nowrap' }}
              >
                + Create Semi-Finished
              </motion.button>
            )}
          </div>
        </div>

        {loading ? <Loading /> : (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'In Stock', value: filteredItems.filter(i => i.quantity > 0).length, color: '#00b894', icon: '✓' },
            { label: 'Out of Stock', value: filteredItems.filter(i => i.quantity === 0).length, color: '#ff4757', icon: '❌' },
            { label: 'Total Items', value: filteredItems.length, color: '#667eea', icon: '📦' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px', color: stat.color, background: `${stat.color}15`, padding: '8px', borderRadius: '8px' }}>{stat.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#636e72', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</p>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#2d3436', fontWeight: '700' }}>{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
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
                  <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td>
                      <span className="badge badge-secondary badge-sm">
                        {item.departmentId?.name || 'No Department'}
                      </span>
                    </td>
                    <td className="font-semibold" style={{ color: '#2d3436' }}>{item.name}</td>
                    <td style={{ fontSize: '12px', color: '#636e72' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.rawMaterials?.map((rm, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                              {rm.inventoryId?.name || 'Unknown'}: {parseFloat((rm.quantity * (item.quantity || 1)).toFixed(1))}{rm.unit}
                            </span>
                            <span style={{ background: '#e8ecff', color: '#667eea', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                              per unit: {rm.quantity}{rm.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="font-bold" style={{ color: '#2d3436' }}>
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

        {totalItems > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        )}

        {filteredItems.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdKitchen /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No semi-finished items yet</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Click "Create Semi-Finished" to start!</p>
          </motion.div>
        )}
        </>
        )}

        {activeDropdown && (
          <>
            <div className="fixed inset-0" style={{ zIndex: 998 }} onClick={() => setActiveDropdown(null)} />
            <div className="fixed bg-white border border-gray-200 rounded-lg shadow-xl three-dots-menu"
              style={{ top: dropdownPosition.top, left: dropdownPosition.left, zIndex: 999, minWidth: '160px', whiteSpace: 'nowrap' }}>
              <button
                onClick={() => { const item = filteredItems.find(i => i._id === activeDropdown); openAddStockModal(item); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 text-left rounded-t-lg"
              >
                <MdAdd className="text-green-500 text-base" /> Add Stock
              </button>
              {canDelete(userRole, 'semi-finished') && (
                <button
                  onClick={() => { deleteItem(activeDropdown); setActiveDropdown(null); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left rounded-b-lg"
                >
                  <MdDelete className="text-red-500 text-base" /> Delete Item
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <CreateSemiFinished isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchSemiFinishedItems} />

      <AddSemiFinishedStock
        isOpen={showAddStockModal}
        onClose={() => { setShowAddStockModal(false); setSelectedItemForStock(null); }}
        onSuccess={fetchSemiFinishedItems}
        semiFinishedItem={selectedItemForStock}
      />
    </>
  );
};

export default SemiFinishedInventory;
