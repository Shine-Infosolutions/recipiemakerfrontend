import React, { useState, useEffect } from 'react';
import { MdAttachMoney, MdFileDownload } from 'react-icons/md';
import { motion } from 'framer-motion';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const RevenueReport = () => {
  const [cookedItems, setCookedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cookedRes, recipeRes] = await Promise.all([
        fetch(`${API_URL}/cooked-items`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_URL}/recipes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setCookedItems(await cookedRes.json());
      setRecipes(await recipeRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const finishedItems = cookedItems.filter(item => item.status === 'finished');
  
  const revenueData = finishedItems.map(item => {
    const recipe = recipes.find(r => r._id === item.recipeId);
    const sellingPrice = recipe?.sellingPrice || 0;
    const revenue = sellingPrice * item.quantity;
    return {
      ...item,
      sellingPrice,
      revenue
    };
  });

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalItemsSold = finishedItems.reduce((sum, item) => sum + item.quantity, 0);
  const averageOrderValue = finishedItems.length > 0 ? totalRevenue / finishedItems.length : 0;

  const exportToExcel = () => {
    const headers = ['Recipe Name', 'Quantity Sold', 'Selling Price', 'Revenue', 'Date'];
    const data = revenueData.map(item => [
      item.title,
      item.quantity,
      item.sellingPrice,
      item.revenue.toFixed(2),
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateSellingPrices = async () => {
    try {
      await fetch(`${API_URL}/recipes/update-selling-prices`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error updating selling prices:', error);
    }
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
            <MdAttachMoney style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Revenue Report
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Revenue analysis from finished goods</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {totalRevenue === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={updateSellingPrices}
              style={{
                padding: window.innerWidth < 768 ? '8px 12px' : '10px 20px',
                background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth < 768 ? '12px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,165,2,0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              Fix Prices
            </motion.button>
          )}
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
          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Total Revenue</div>
              <div className="stat-value" style={{ color: '#00b894' }}>₹{totalRevenue.toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Items Sold</div>
              <div className="stat-value" style={{ color: '#667eea' }}>{totalItemsSold}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Orders</div>
              <div className="stat-value" style={{ color: '#ffa502' }}>{finishedItems.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Avg Order Value</div>
              <div className="stat-value" style={{ color: '#3742fa' }}>₹{averageOrderValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="table w-full">
              <thead style={{ backgroundColor: '#f1f3f5' }}>
                <tr>
                  <th style={{ color: '#2d3436' }}>Recipe Name</th>
                  <th style={{ color: '#2d3436' }}>Quantity Sold</th>
                  <th style={{ color: '#2d3436' }}>Selling Price</th>
                  <th style={{ color: '#2d3436' }}>Revenue</th>
                  <th style={{ color: '#2d3436' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="font-semibold" style={{ color: '#2d3436' }}>{item.title}</td>
                    <td>
                      <span className="badge badge-outline" style={{ color: '#2d3436' }}>x{item.quantity}</span>
                    </td>
                    <td style={{ color: '#2d3436' }}>₹{item.sellingPrice}</td>
                    <td className="font-bold" style={{ color: '#00b894' }}>₹{item.revenue.toFixed(2)}</td>
                    <td style={{ fontSize: '12px', color: '#636e72' }}>
                      {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {revenueData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdAttachMoney /></div>
              <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No revenue data yet</p>
              <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Complete some recipes to see revenue!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RevenueReport;