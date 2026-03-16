import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdBarChart, MdPieChart, MdTrendingUp, MdTrendingDown, MdError } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Analytics = () => {
  const [inventory, setInventory] = useState([]);
  const [lossItems, setLossItems] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, lossRes, stockRes] = await Promise.all([
        fetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_URL}/losses`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_URL}/stock-logs`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(Array.isArray(invData) ? invData : []);
      } else {
        setInventory([]);
      }
      
      if (lossRes.ok) {
        const lossData = await lossRes.json();
        setLossItems(Array.isArray(lossData) ? lossData : []);
      } else {
        setLossItems([]);
      }
      
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStockLogs(Array.isArray(stockData) ? stockData : []);
      } else {
        setStockLogs([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setInventory([]);
      setLossItems([]);
      setStockLogs([]);
    }
    setLoading(false);
  };

  // Chart data preparation
  const categories = [...new Set(inventory.map(item => item.category))];
  const categoryData = categories.map(cat => {
    const items = inventory.filter(item => item.category === cat);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
    return {
      name: cat,
      items: items.length,
      value: totalValue,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  });

  // Stock activity data (last 7 days)
  const getStockActivityData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = stockLogs.filter(log => {
        const logDate = new Date(log.createdAt).toISOString().split('T')[0];
        return logDate === dateStr;
      });
      
      const added = dayLogs.filter(log => log.action === 'Added').reduce((sum, log) => sum + log.quantity, 0);
      const used = dayLogs.filter(log => log.action === 'Used').reduce((sum, log) => sum + log.quantity, 0);
      const restocked = dayLogs.filter(log => log.action === 'Restocked').reduce((sum, log) => sum + log.quantity, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        added,
        used,
        restocked
      });
    }
    return last7Days;
  };

  // Loss trend data (last 30 days)
  const getLossTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLosses = lossItems.filter(loss => {
        const lossDate = new Date(loss.lossDate).toISOString().split('T')[0];
        return lossDate === dateStr;
      });
      
      const lossValue = dayLosses.reduce((sum, loss) => sum + (loss.lossValue || 0), 0);
      const lossCount = dayLosses.length;
      
      if (i % 5 === 0 || lossValue > 0) {
        last30Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: lossValue,
          count: lossCount
        });
      }
    }
    return last30Days;
  };

  // Top ingredients by usage
  const getTopIngredientsData = () => {
    const ingredientUsage = {};
    
    stockLogs.filter(log => log.action === 'Used').forEach(log => {
      if (ingredientUsage[log.itemName]) {
        ingredientUsage[log.itemName] += log.quantity;
      } else {
        ingredientUsage[log.itemName] = log.quantity;
      }
    });
    
    return Object.entries(ingredientUsage)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  };

  const stockActivityData = getStockActivityData();
  const lossTrendData = getLossTrendData();
  const topIngredientsData = getTopIngredientsData();

  const COLORS = ['#667eea', '#ff4757', '#00b894', '#ffa502', '#e74c3c', '#9b59b6', '#3498db', '#f39c12'];

  return (
    <div style={{ 
      marginTop: window.innerWidth < 768 ? '0px' : '0px',
      padding: window.innerWidth < 768 ? '15px' : '30px',
      background: '#f8f9fa',
      minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '20px' }}
      >
        <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MdBarChart style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Analytics & Charts
        </h1>
        {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Comprehensive analytics and insights for your kitchen operations</p>}
      </motion.div>

      {loading ? <Loading /> : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            {/* Stock Activity Chart */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdTrendingUp style={{ color: '#667eea' }} /> Stock Activity (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="added" fill="#00b894" name="Added" />
                  <Bar dataKey="used" fill="#ff4757" name="Used" />
                  <Bar dataKey="restocked" fill="#ffa502" name="Restocked" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution Pie Chart */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdPieChart style={{ color: '#667eea' }} /> Inventory by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="items"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Row of Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '20px' }}>
            
            {/* Loss Trend Chart */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdError style={{ color: '#ff4757' }} /> Loss Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lossTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ff4757" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Ingredients Usage */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdTrendingDown style={{ color: '#e74c3c' }} /> Top Used Ingredients
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topIngredientsData.map(item => ({ name: item.name, quantity: item.quantity }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#e74c3c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;