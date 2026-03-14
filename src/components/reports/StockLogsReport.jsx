import React, { useState, useEffect } from 'react';
import { MdHistory, MdFileDownload } from 'react-icons/md';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const StockLogsReport = () => {
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockLogs();
  }, []);

  const fetchStockLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stock-logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setStockLogs(data);
    } catch (error) {
      console.error('Error fetching stock logs:', error);
    }
    setLoading(false);
  };

  const updateDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/stock-logs/update-departments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      toast.success(`${data.message}`);
      fetchStockLogs(); // Refresh the data
    } catch (error) {
      console.error('Error updating departments:', error);
      toast.error('Failed to update departments');
    }
  };

  const exportToExcel = () => {
    const headers = ['Item Name', 'Department', 'Action', 'Quantity', 'Previous Stock', 'New Stock', 'Date'];
    const data = stockLogs.map(log => [
      log.itemName,
      log.departmentId?.name || log.departmentName || '-',
      log.action,
      log.quantity,
      log.previousStock,
      log.newStock,
      log.createdAt ? new Date(log.createdAt).toLocaleString() : ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-logs-report-${new Date().toISOString().split('T')[0]}.csv`;
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
            <MdHistory style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Stock Logs Report
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Track all inventory movements</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={updateDepartments}
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Update Departments
          </motion.button>
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
      </div>

      {loading ? <Loading /> : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="table w-full">
              <thead style={{ backgroundColor: '#f1f3f5' }}>
                <tr>
                  <th style={{ color: '#2d3436' }}>Item Name</th>
                  <th style={{ color: '#2d3436' }}>Department</th>
                  <th style={{ color: '#2d3436' }}>Action</th>
                  <th style={{ color: '#2d3436' }}>Quantity</th>
                  <th style={{ color: '#2d3436' }}>Previous Stock</th>
                  <th style={{ color: '#2d3436' }}>New Stock</th>
                  <th style={{ color: '#2d3436' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stockLogs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="font-semibold" style={{ color: '#2d3436' }}>{log.itemName}</td>
                    <td style={{ padding: '12px' }}>
                      {log.departmentId?.name || log.departmentName ? (
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#667eea', 
                          background: '#f0f2ff', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontWeight: '600',
                          border: '1px solid #667eea'
                        }}>
                          {log.departmentId?.name || log.departmentName}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#636e72' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${log.action === 'Added' ? 'badge-success' : log.action === 'Used' ? 'badge-error' : 'badge-warning'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: '#2d3436' }}>{log.quantity}</td>
                    <td style={{ color: '#636e72' }}>{log.previousStock}</td>
                    <td style={{ color: '#2d3436', fontWeight: '600' }}>{log.newStock}</td>
                    <td style={{ fontSize: '12px', color: '#636e72' }}>
                      {log.createdAt && new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stockLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdHistory /></div>
              <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No stock logs yet</p>
              <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Stock movements will appear here!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockLogsReport;