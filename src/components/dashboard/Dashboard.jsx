import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdDashboard, MdInventory, MdRestaurant, MdRestaurantMenu, MdTrendingUp, MdTrendingDown, MdAttachMoney } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [cookedItems, setCookedItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [invRes, recRes, cookedRes] = await Promise.all([
      fetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      fetch(`${API_URL}/recipes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      fetch(`${API_URL}/cooked-items`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    ]);
    setInventory(await invRes.json());
    setRecipes(await recRes.json());
    setCookedItems(await cookedRes.json());
    setLoading(false);
  };

  const filterRecipesByDate = () => {
    if (filterType === 'all') {
      return recipes;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    return recipes.filter(recipe => {
      const recipeDate = recipe.createdAt ? new Date(recipe.createdAt) : new Date();
      
      if (filterType === 'today') {
        return recipeDate >= today;
      } else if (filterType === 'weekly') {
        return recipeDate >= weekAgo;
      } else if (filterType === 'monthly') {
        return recipeDate >= monthAgo;
      } else if (filterType === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return recipeDate >= start && recipeDate <= end;
      }
      return true;
    });
  };

  const filteredRecipes = filterRecipesByDate();
  const filteredInventory = categoryFilter === 'all' ? inventory : inventory.filter(item => item.category === categoryFilter);
  const rawMaterials = cookedItems.filter(item => item.status === 'cooking');

  // Calculate ingredients used and restocked from cooked items
  const usedIngredients = cookedItems
    .filter(item => item.status === 'finished' || item.status === 'cooking')
    .flatMap(item => item.ingredients || [])
    .reduce((acc, ing) => {
      const existing = acc.find(a => a.name === ing.name);
      if (existing) {
        existing.quantity += ing.quantity;
      } else {
        acc.push({ ...ing });
      }
      return acc;
    }, []);

  const restockedIngredients = cookedItems
    .filter(item => item.status === 'semi-finished')
    .flatMap(item => item.ingredients || [])
    .reduce((acc, ing) => {
      const existing = acc.find(a => a.name === ing.name);
      if (existing) {
        existing.quantity += ing.quantity;
      } else {
        acc.push({ ...ing });
      }
      return acc;
    }, []);

  const ingredientsUsed = usedIngredients.reduce((sum, ing) => sum + ing.quantity, 0);
  const ingredientsRestocked = restockedIngredients.reduce((sum, ing) => sum + ing.quantity, 0);

  // Statistics - remove status-based filtering since recipes are just templates
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
  const lowStockItems = inventory.filter(item => item.quantity < 10).length;
  const categories = [...new Set(inventory.map(item => item.category))];

  const StatCard = ({ icon, title, value, color, subtitle, index = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', scale: 1.02 }}
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div style={{ 
        fontSize: '40px', 
        color: color,
        background: `${color}15`,
        padding: '12px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#636e72', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
        <h2 style={{ margin: '4px 0 0 0', fontSize: '28px', color: '#2d3436', fontWeight: '700' }}>{value}</h2>
        {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#95a5a6', fontWeight: '500' }}>{subtitle}</p>}
      </div>
    </motion.div>
  );

  return (
    <>
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
            <MdDashboard style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Dashboard
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Overview of your recipe management system</p>}
          
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '8px 16px',
                background: filterType === 'all' ? '#667eea' : 'white',
                color: filterType === 'all' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('today')}
              style={{
                padding: '8px 16px',
                background: filterType === 'today' ? '#667eea' : 'white',
                color: filterType === 'today' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Today
            </button>
            <button
              onClick={() => setFilterType('weekly')}
              style={{
                padding: '8px 16px',
                background: filterType === 'weekly' ? '#667eea' : 'white',
                color: filterType === 'weekly' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Weekly
            </button>
            <button
              onClick={() => setFilterType('monthly')}
              style={{
                padding: '8px 16px',
                background: filterType === 'monthly' ? '#667eea' : 'white',
                color: filterType === 'monthly' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilterType('range')}
              style={{
                padding: '8px 16px',
                background: filterType === 'range' ? '#667eea' : 'white',
                color: filterType === 'range' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Date Range
            </button>
            {filterType === 'range' && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #667eea',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    color: 'black'
                  }}
                />
                <span style={{ color: '#636e72', fontSize: '13px' }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #667eea',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    color: 'black'
                  }}
                />
              </>
            )}
          </div>
        </motion.div>
        {loading ? <Loading /> : (
        <>
        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}
        >
          <StatCard icon={<MdInventory />} title="Total Items" value={inventory.length} color="#667eea" subtitle={`Worth $${totalInventoryValue.toFixed(2)}`} index={0} />
          <StatCard icon={<MdTrendingDown />} title="Low Stock" value={lowStockItems} color="#ff4757" subtitle="Items below 10 units" index={1} />
          <StatCard icon={<MdRestaurantMenu />} title="Total Recipes" value={recipes.length} color="#667eea" subtitle="Available templates" index={2} />
          <StatCard icon={<MdRestaurant />} title="Finished Goods" value={cookedItems.filter(item => item.status === 'finished').length} color="#00b894" subtitle="Completed items" index={3} />
          <StatCard icon={<GiCookingPot />} title="Semi-Finished" value={cookedItems.filter(item => item.status === 'semi-finished').length} color="#ffa502" subtitle="Partial items" index={4} />
          <StatCard icon={<MdTrendingDown />} title="Ingredients Used" value={ingredientsUsed} color="#e74c3c" subtitle="From cooking" index={5} />
          <StatCard icon={<MdTrendingUp />} title="Ingredients Restocked" value={ingredientsRestocked} color="#00b894" subtitle="From cancelled" index={6} />
        </motion.div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Ingredients Used Section */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdTrendingDown style={{ color: '#e74c3c' }} /> Ingredients Used ({usedIngredients.length})
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {usedIngredients.map((ing, idx) => (
                <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>{ing.name}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#e74c3c' }}>
                    -{ing.quantity} {ing.unit}
                  </p>
                </div>
              ))}
              {usedIngredients.length === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px', padding: '20px' }}>No ingredients used</p>
              )}
            </div>
          </div>

          {/* Ingredients Restocked Section */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdTrendingUp style={{ color: '#00b894' }} /> Ingredients Restocked ({restockedIngredients.length})
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {restockedIngredients.map((ing, idx) => (
                <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>{ing.name}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#00b894' }}>
                    +{ing.quantity} {ing.unit}
                  </p>
                </div>
              ))}
              {restockedIngredients.length === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px', padding: '20px' }}>No ingredients restocked</p>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '20px' }}>
          {/* Inventory Section */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdInventory style={{ color: '#667eea' }} /> Inventory Items ({filteredInventory.length})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredInventory.slice(0, 10).map(item => (
                <div key={item._id} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>{item.name}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#636e72' }}>{item.category}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: item.quantity < 10 ? '#ff4757' : '#00b894' }}>
                      {item.quantity} {item.unit}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#636e72' }}>${item.price || 0}</p>
                  </div>
                </div>
              ))}
              {filteredInventory.length === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px', padding: '20px' }}>No items found</p>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdAttachMoney style={{ color: '#667eea' }} /> Inventory by Category
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {categories.map(cat => {
              const items = inventory.filter(item => item.category === cat);
              const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
              return (
                <div key={cat} style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#2d3436', textTransform: 'capitalize' }}>{cat}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#667eea' }}>{items.length} items</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#636e72' }}>${totalValue.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
        </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
