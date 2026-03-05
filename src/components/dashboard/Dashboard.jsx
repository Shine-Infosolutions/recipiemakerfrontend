import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdDashboard, MdInventory, MdRestaurant, MdRestaurantMenu, MdTrendingUp, MdTrendingDown, MdAttachMoney } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
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
    const [invRes, recRes, rmRes] = await Promise.all([
      fetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      fetch(`${API_URL}/recipes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      fetch(`${API_URL}/rawmaterials`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    ]);
    setInventory(await invRes.json());
    setRecipes(await recRes.json());
    setRawMaterials(await rmRes.json());
    setLoading(false);
  };

  const filterRecipesByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return recipes.filter(recipe => {
      if (!recipe.createdAt) return false;
      const recipeDate = new Date(recipe.createdAt);
      
      if (filterType === 'today') {
        return recipeDate >= today;
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

  // Calculate ingredients used and restocked
  const usedIngredients = [];
  const restockedIngredients = [];

  filteredRecipes
    .filter(r => r.status === 'cooking' || r.status === 'cooked')
    .forEach(recipe => {
      recipe.ingredients?.forEach(ing => {
        const existing = usedIngredients.find(i => i.name === ing.inventoryId?.name);
        if (existing) {
          existing.quantity += ing.quantity;
        } else {
          usedIngredients.push({
            name: ing.inventoryId?.name || 'Unknown',
            quantity: ing.quantity,
            unit: ing.unit
          });
        }
      });
    });

  filteredRecipes
    .filter(r => r.status === 'cancelled')
    .forEach(recipe => {
      recipe.ingredients?.forEach(ing => {
        const existing = restockedIngredients.find(i => i.name === ing.inventoryId?.name);
        if (existing) {
          existing.quantity += ing.quantity;
        } else {
          restockedIngredients.push({
            name: ing.inventoryId?.name || 'Unknown',
            quantity: ing.quantity,
            unit: ing.unit
          });
        }
      });
    });

  const ingredientsUsed = usedIngredients.reduce((sum, ing) => sum + 1, 0);
  const ingredientsRestocked = restockedIngredients.reduce((sum, ing) => sum + 1, 0);

  // Statistics
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
  const lowStockItems = inventory.filter(item => item.quantity < 10).length;
  const cookingRecipes = filteredRecipes.filter(r => r.status === 'cooking').length;
  const cookedRecipes = filteredRecipes.filter(r => r.status === 'cooked').length;
  const cancelledRecipes = filteredRecipes.filter(r => r.status === 'cancelled').length;
  const categories = [...new Set(inventory.map(item => item.category))];

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}
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
        position: 'fixed',
        top: 0,
        left: window.innerWidth < 768 ? 0 : '250px',
        right: 0,
        background: '#f8f9fa',
        zIndex: 10,
        padding: window.innerWidth < 768 ? '12px 15px' : '16px 30px',
        borderBottom: '2px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdDashboard style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dashboard</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Overview of your recipe management system</p>}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: window.innerWidth < 768 ? '70px' : '90px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 130px)' : 'calc(100vh - 90px)'
      }}>
        {loading ? <Loading /> : (
        <>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon={<MdInventory />} title="Total Items" value={inventory.length} color="#667eea" subtitle={`Worth $${totalInventoryValue.toFixed(2)}`} />
          <StatCard icon={<MdTrendingDown />} title="Low Stock" value={lowStockItems} color="#ff4757" subtitle="Items below 10 units" />
          <StatCard icon={<MdRestaurantMenu />} title="Raw Materials" value={rawMaterials.length} color="#ffa502" subtitle="Recipe templates" />
          <StatCard icon={<GiCookingPot />} title="Finished Goods" value={cookingRecipes} color="#ffa502" subtitle="In progress" />
          <StatCard icon={<MdRestaurant />} title="Cooked" value={cookedRecipes} color="#00b894" subtitle="Completed recipes" />
          <StatCard icon={<MdTrendingUp />} title="Cancelled" value={cancelledRecipes} color="#ff4757" subtitle="Semi-finished" />
          <StatCard icon={<MdTrendingDown />} title="Ingredients Used" value={ingredientsUsed} color="#e74c3c" subtitle="From inventory" />
          <StatCard icon={<MdTrendingUp />} title="Ingredients Restocked" value={ingredientsRestocked} color="#00b894" subtitle="From cancelled" />
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Filters</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#636e72', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Recipe Date</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="range">Date Range</option>
              </select>
            </div>
            {filterType === 'range' && (
              <>
                <div>
                  <label style={{ fontSize: '12px', color: '#636e72', fontWeight: '600', display: 'block', marginBottom: '4px' }}>From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #dfe6e9',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#636e72', fontWeight: '600', display: 'block', marginBottom: '4px' }}>To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #dfe6e9',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: '12px', color: '#636e72', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Inventory Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </div>

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

          {/* Raw Materials Section */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdRestaurantMenu style={{ color: '#ffa502' }} /> Raw Materials ({rawMaterials.length})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {rawMaterials.slice(0, 10).map(rm => (
                <div key={rm._id} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>
                    {rm.recipeName} {rm.variation && `(${rm.variation})`}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#636e72' }}>
                    {rm.ingredients?.length || 0} ingredients
                  </p>
                </div>
              ))}
              {rawMaterials.length === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px', padding: '20px' }}>No raw materials found</p>
              )}
            </div>
          </div>

          {/* Finished Goods Section */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GiCookingPot style={{ color: '#ffa502' }} /> Finished Goods ({cookingRecipes})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredRecipes.filter(r => r.status === 'cooking').slice(0, 10).map(recipe => (
                <div key={recipe._id} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>{recipe.title}</p>
                    {recipe.quantity > 1 && (
                      <span style={{ fontSize: '10px', color: '#667eea', background: '#f0f3ff', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                        x{recipe.quantity}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#636e72' }}>
                    {recipe.createdAt && new Date(recipe.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {cookingRecipes === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px', padding: '20px' }}>No finished goods</p>
              )}
            </div>
          </div>

          {/* Cooked Recipes Section */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdRestaurant style={{ color: '#00b894' }} /> Cooked ({cookedRecipes})
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredRecipes.filter(r => r.status === 'cooked').slice(0, 10).map(recipe => (
                <div key={recipe._id} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>{recipe.title}</p>
                    {recipe.quantity > 1 && (
                      <span style={{ fontSize: '10px', color: '#667eea', background: '#f0f3ff', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                        x{recipe.quantity}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#636e72' }}>
                    {recipe.createdAt && new Date(recipe.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {cookedRecipes === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontSize: '13px', padding: '20px' }}>No cooked recipes</p>
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
