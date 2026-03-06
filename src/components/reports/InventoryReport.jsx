import React, { useState, useEffect } from 'react';
import { MdInventory, MdFileDownload } from 'react-icons/md';
import { motion } from 'framer-motion';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const InventoryReport = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInventory(await res.json());
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
    setLoading(false);
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);

  const exportToExcel = () => {
    const headers = ['Item Name', 'Category', 'Quantity', 'Unit', 'Price', 'Total Value'];
    const data = inventory.map(item => [
      item.name,
      item.category || '',
      item.quantity,
      item.unit,
      item.price || 0,
      ((item.price || 0) * item.quantity).toFixed(2)
    ]);
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
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
            <MdInventory style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Inventory Report
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Complete inventory analysis and statistics</p>}
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

      {loading ? <Loading /> : (
        <>
          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Total Items</div>
              <div className="stat-value" style={{ color: '#667eea' }}>{inventory.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Total Value</div>
              <div className="stat-value" style={{ color: '#00b894' }}>₹{totalValue.toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Low Stock</div>
              <div className="stat-value" style={{ color: '#ff4757' }}>{inventory.filter(item => item.quantity < 10).length}</div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="table w-full">
              <thead style={{ backgroundColor: '#f1f3f5' }}>
                <tr>
                  <th style={{ color: '#2d3436' }}>Item Name</th>
                  <th style={{ color: '#2d3436' }}>Category</th>
                  <th style={{ color: '#2d3436' }}>Quantity</th>
                  <th style={{ color: '#2d3436' }}>Unit</th>
                  <th style={{ color: '#2d3436' }}>Price</th>
                  <th style={{ color: '#2d3436' }}>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="font-semibold" style={{ color: '#2d3436' }}>{item.name}</td>
                    <td>
                      {item.category && (
                        <span className="badge badge-primary badge-sm">{item.category}</span>
                      )}
                    </td>
                    <td className={item.quantity < 10 ? 'font-bold' : 'font-bold'} style={{ color: item.quantity < 10 ? '#ff4757' : '#2d3436' }}>
                      {item.quantity}
                    </td>
                    <td style={{ color: '#2d3436' }}>{item.unit}</td>
                    <td style={{ color: '#2d3436' }}>₹{item.price || 0}</td>
                    <td className="font-bold" style={{ color: '#2d3436' }}>₹{((item.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryReport;