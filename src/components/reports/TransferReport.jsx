import React, { useState, useEffect } from 'react';
import { MdSwapHoriz, MdFileDownload, MdFilterList } from 'react-icons/md';
import { motion } from 'framer-motion';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const TransferReport = () => {
  const [transfers, setTransfers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departmentId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchTransfers();
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const res = await fetch(`${API_URL}/transfers?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTransfers(data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      departmentId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
  };

  const totalTransfers = transfers.length;
  const totalQuantity = transfers.reduce((sum, transfer) => sum + transfer.quantity, 0);
  const uniqueItems = new Set(transfers.map(t => t.itemName)).size;

  const exportToExcel = () => {
    const headers = ['Date', 'Item Name', 'From Department', 'To Department', 'Quantity', 'Unit', 'Transferred By', 'Notes'];
    const data = transfers.map(transfer => [
      new Date(transfer.transferDate).toLocaleDateString(),
      transfer.itemName,
      transfer.fromDepartmentId?.name || 'N/A',
      transfer.toDepartmentId?.name || 'N/A',
      transfer.quantity,
      transfer.unit || 'N/A',
      transfer.transferredBy?.name || 'N/A',
      transfer.notes || ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transfer-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      marginTop: window.innerWidth < 768 ? '0px' : '0px',
      padding: window.innerWidth < 768 ? '15px' : '30px',
      background: '#f8f9fa',
      minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdSwapHoriz style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Transfer Report
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Item transfer history and analytics</p>}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToExcel}
          style={{
            padding: window.innerWidth < 768 ? '8px 12px' : '10px 20px',
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: window.innerWidth < 768 ? '12px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,184,148,0.3)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MdFileDownload /> Export Excel
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MdFilterList style={{ color: '#667eea', fontSize: '20px' }} />
          <h3 style={{ margin: 0, color: '#2d3436', fontSize: '16px', fontWeight: '600' }}>Filters</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#636e72' }}>Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2d3436'
              }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#636e72' }}>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2d3436'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#636e72' }}>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2d3436'
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              background: '#636e72',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear
          </motion.button>
        </div>
      </div>

      {loading ? <Loading /> : (
        <>
          {/* Statistics */}
          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Total Transfers</div>
              <div className="stat-value" style={{ color: '#667eea' }}>{totalTransfers}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Total Quantity</div>
              <div className="stat-value" style={{ color: '#00b894' }}>{totalQuantity}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Unique Items</div>
              <div className="stat-value" style={{ color: '#fdcb6e' }}>{uniqueItems}</div>
            </div>
          </div>

          {/* Transfer Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="table w-full">
              <thead style={{ backgroundColor: '#f1f3f5' }}>
                <tr>
                  <th style={{ color: '#2d3436' }}>Date</th>
                  <th style={{ color: '#2d3436' }}>Item Name</th>
                  <th style={{ color: '#2d3436' }}>From</th>
                  <th style={{ color: '#2d3436' }}>To</th>
                  <th style={{ color: '#2d3436' }}>Quantity</th>
                  <th style={{ color: '#2d3436' }}>Unit</th>
                  <th style={{ color: '#2d3436' }}>Transferred By</th>
                  <th style={{ color: '#2d3436' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(transfer => (
                  <tr 
                    key={transfer._id} 
                    style={{ borderBottom: '1px solid #e9ecef' }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ color: '#2d3436' }}>
                      {new Date(transfer.transferDate).toLocaleDateString()}
                    </td>
                    <td className="font-semibold" style={{ color: '#2d3436' }}>
                      {transfer.itemName}
                    </td>
                    <td>
                      <span className="badge badge-outline badge-sm" style={{ color: '#e74c3c', borderColor: '#e74c3c' }}>
                        {transfer.fromDepartmentId?.name || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-outline badge-sm" style={{ color: '#00b894', borderColor: '#00b894' }}>
                        {transfer.toDepartmentId?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="font-bold" style={{ color: '#2d3436' }}>
                      {transfer.quantity}
                    </td>
                    <td style={{ color: '#2d3436' }}>
                      {transfer.unit || 'N/A'}
                    </td>
                    <td style={{ color: '#2d3436' }}>
                      {transfer.transferredBy?.name || 'N/A'}
                    </td>
                    <td style={{ color: '#636e72', fontSize: '12px' }}>
                      {transfer.notes || '-'}
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8" style={{ color: '#636e72' }}>
                      No transfers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TransferReport;