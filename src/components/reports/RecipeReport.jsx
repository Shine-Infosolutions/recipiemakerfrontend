import React, { useState, useEffect } from 'react';
import { MdRestaurant, MdFileDownload } from 'react-icons/md';
import { motion } from 'framer-motion';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const RecipeReport = () => {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, invRes] = await Promise.all([
        fetch(`${API_URL}/recipes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setRecipes(await recRes.json());
      setInventory(await invRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const canCookRecipe = (recipe) => {
    return recipe.ingredients?.every(ing => {
      const invItem = inventory.find(i => i._id === ing.inventoryId?._id);
      return invItem && invItem.quantity >= ing.quantity;
    });
  };

  const availableRecipes = recipes.filter(canCookRecipe).length;
  const activeRecipes = recipes.filter(recipe => recipe.isActive !== false).length;
  const inactiveRecipes = recipes.length - activeRecipes;

  const exportToExcel = () => {
    const headers = ['Recipe Name', 'Ingredients', 'Recipe Status', 'Availability'];
    const data = recipes.map(recipe => [
      recipe.title,
      recipe.ingredients?.map(ing => `${ing.inventoryId?.name || 'Unknown'}: ${ing.quantity}${ing.unit}`).join('; ') || '',
      recipe.isActive !== false ? 'Active' : 'Inactive',
      canCookRecipe(recipe) && recipe.isActive !== false ? 'Available' : 'Unavailable'
    ]);
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-report-${new Date().toISOString().split('T')[0]}.csv`;
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
            <MdRestaurant style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Recipe Report
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Recipe availability and ingredient analysis</p>}
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
              <div className="stat-title" style={{ color: '#636e72' }}>Total Recipes</div>
              <div className="stat-value" style={{ color: '#667eea' }}>{recipes.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Active Recipes</div>
              <div className="stat-value" style={{ color: '#00b894' }}>{activeRecipes}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Inactive Recipes</div>
              <div className="stat-value" style={{ color: '#ff4757' }}>{inactiveRecipes}</div>
            </div>
            <div className="stat">
              <div className="stat-title" style={{ color: '#636e72' }}>Available to Cook</div>
              <div className="stat-value" style={{ color: '#667eea' }}>{availableRecipes}</div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="table w-full">
              <thead style={{ backgroundColor: '#f1f3f5' }}>
                <tr>
                  <th style={{ color: '#2d3436' }}>Recipe Name</th>
                  <th style={{ color: '#2d3436' }}>Ingredients</th>
                  <th style={{ color: '#2d3436' }}>Recipe Status</th>
                  <th style={{ color: '#2d3436' }}>Availability</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(recipe => (
                  <tr key={recipe._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="font-semibold" style={{ color: '#2d3436' }}>{recipe.title}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {recipe.ingredients?.map((ing, idx) => {
                          const invItem = inventory.find(i => i._id === ing.inventoryId?._id);
                          const hasEnough = invItem && invItem.quantity >= ing.quantity;
                          return (
                            <span key={idx} style={{ 
                              background: hasEnough ? '#e8f5e9' : '#ffebee', 
                              color: hasEnough ? '#2e7d32' : '#c62828',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              {ing.inventoryId?.name || 'Unknown'}: {ing.quantity}{ing.unit}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${recipe.isActive !== false ? 'badge-success' : 'badge-error'}`}>
                        {recipe.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${canCookRecipe(recipe) && recipe.isActive !== false ? 'badge-success' : 'badge-error'}`}>
                        {canCookRecipe(recipe) && recipe.isActive !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
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

export default RecipeReport;