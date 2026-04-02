import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import LossModal from '../common/LossModal';
import { useDepartments } from '../../contexts/DepartmentContext';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const InProgress = () => {
  const [cookingItems, setCookingItems] = useState([]);
  const [filteredCookingItems, setFilteredCookingItems] = useState([]);
  const { departments } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLossModal, setShowLossModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchCookingItems();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {}
    }
  }, []);

  useEffect(() => {
    if (userRole === 'Admin') {
      // Admin can filter by department or see all
      if (selectedDepartment) {
        setFilteredCookingItems(cookingItems.filter(item => 
          item.recipeId?.departmentId?._id === selectedDepartment
        ));
      } else {
        setFilteredCookingItems(cookingItems);
      }
    } else {
      // Non-admin users see only their department's cooking items
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.departmentId) {
            setFilteredCookingItems(cookingItems.filter(item => 
              item.recipeId?.departmentId?._id === payload.departmentId
            ));
          } else {
            setFilteredCookingItems(cookingItems);
          }
        } catch (error) {
          setFilteredCookingItems(cookingItems);
        }
      } else {
        setFilteredCookingItems(cookingItems);
      }
    }
  }, [cookingItems, selectedDepartment, userRole]);

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
      setCookingItems(data.filter(item => item.status === 'cooking'));
    } catch (error) {
      setCookingItems([]);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/cooked-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to update status');
        return;
      }
      fetchCookingItems();
      toast.success(status === 'finished' ? 'Item marked as finished!' : 'Order cancelled and ingredients restocked!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Pagination logic
  const totalItems = filteredCookingItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCookingItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, filteredCookingItems.length]);

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
              <GiCookingPot style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Cooking
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Items currently being cooked</p>}
          </div>
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
        </div>
        {loading ? <Loading /> : (
        <>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Department</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Quantity</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Total Value</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const totalValue = (item.recipeId?.sellingPrice || 0) * item.quantity;
                return (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.title}
                      {item.isAdjusted && (
                        <span style={{
                          fontSize: '10px',
                          color: '#ff6b35',
                          background: '#fff3e0',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          border: '1px solid #ffcc99'
                        }}>
                          ADJUSTED
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {item.recipeId?.departmentId ? (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#667eea', 
                        background: '#e8ecff', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontWeight: '600' 
                      }}>
                        {item.recipeId.departmentId.name} ({item.recipeId.departmentId.code})
                      </span>
                    ) : (
                      <span style={{ color: '#ff4757', fontSize: '12px' }}>No Department</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#ffa502', background: '#fff3e0', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>x{item.quantity}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#00b894', fontWeight: '600' }}>₹{totalValue.toFixed(2)}</span>
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
                      <button onClick={() => { setSelectedItem(item); setShowLossModal(true); }} style={{ padding: '8px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        Loss
                      </button>
                      <button onClick={() => updateStatus(item._id, 'cancelled')} style={{ padding: '8px 12px', background: '#636e72', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
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

        {filteredCookingItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><GiCookingPot /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              {selectedDepartment ? 'No cooking items found for selected department' : 'No items cooking'}
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              {selectedDepartment ? 'Try selecting a different department or start cooking recipes.' : 'Go to Recipes page to start cooking!'}
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>

      <LossModal
        isOpen={showLossModal}
        onClose={() => { setShowLossModal(false); setSelectedItem(null); }}
        selectedItem={selectedItem}
        onSuccess={fetchCookingItems}
      />
    </>
  );
};

export default InProgress;
