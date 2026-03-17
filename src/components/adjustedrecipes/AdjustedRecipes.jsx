import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdCalendarToday, MdCompareArrows } from 'react-icons/md';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const AdjustedRecipes = () => {
  const [adjustedRecipes, setAdjustedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchAdjustedRecipes();
  }, []);

  const fetchAdjustedRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/adjusted-recipes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAdjustedRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching adjusted recipes:', error);
    }
    setLoading(false);
  };

  const filterRecipes = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return adjustedRecipes.filter(recipe => {
      if (!recipe.createdAt) return false;
      const recipeDate = new Date(recipe.createdAt);
      
      if (filterType === 'today') {
        return recipeDate >= today;
      } else if (filterType === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return recipeDate >= start && recipeDate <= end;
      }
      return true;
    });
  };

  const openDetailsModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailsModal(true);
  };

  const filteredRecipes = filterRecipes();

  // Pagination logic
  const totalItems = filteredRecipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, startDate, endDate, adjustedRecipes.length]);

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
              <MdEdit style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Adjusted Recipes
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Recipes cooked with custom ingredient quantities</p>}
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginRight: '8px' }}>Filter by:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  background: 'white',
                  color: '#2d3436'
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="range">Date Range</option>
              </select>
            </div>
            
            {filterType === 'range' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdCalendarToday style={{ fontSize: '16px', color: '#667eea' }} />
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginRight: '8px' }}>From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      color: '#2d3436',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdCalendarToday style={{ fontSize: '16px', color: '#667eea' }} />
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436', marginRight: '8px' }}>To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      color: '#2d3436',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {loading ? <Loading /> : (
        <>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Adjustments</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecipes.map((recipe) => (
                <tr key={recipe._id} style={{ borderBottom: '1px solid #e9ecef', borderLeft: '3px solid #ff6b35' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {recipe.title}
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
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {recipe.adjustedIngredients?.slice(0, 3).map((ing, idx) => (
                        <span key={idx} style={{ 
                          fontSize: '11px', 
                          color: '#ff6b35',
                          background: '#fff3e0',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          border: '1px solid #ffcc99'
                        }}>
                          {ing.name}: {ing.originalQuantity} → {ing.adjustedQuantity} {ing.unit}
                        </span>
                      ))}
                      {recipe.adjustedIngredients?.length > 3 && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#636e72',
                          background: '#f8f9fa',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          +{recipe.adjustedIngredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                    {recipe.createdAt && (() => {
                      const date = new Date(recipe.createdAt);
                      const dateStr = date.toLocaleDateString('en-GB');
                      const timeStr = date.toLocaleTimeString('en-US', { hour12: true });
                      return `${dateStr}, ${timeStr}`;
                    })()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => openDetailsModal(recipe)}
                      style={{ 
                        padding: '8px 12px', 
                        background: '#667eea', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MdCompareArrows style={{ fontSize: '16px' }} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
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

        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdEdit /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              No adjusted recipes found
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              Adjusted recipes will appear here when you cook recipes with custom ingredient quantities
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>

      {showDetailsModal && selectedRecipe && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl" style={{ backgroundColor: '#2d3436', color: '#ffffff' }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: '#ffffff' }}>
              <MdCompareArrows className="inline mr-2" /> Recipe Adjustment Details
            </h3>
            
            <div className="mb-6">
              <h4 className="text-base font-semibold mb-3" style={{ color: '#ffffff' }}>{selectedRecipe.title}</h4>
              <p className="text-sm mb-4" style={{ color: '#b2bec3' }}>
                Cooked on: {new Date(selectedRecipe.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card p-4" style={{ backgroundColor: '#636e72', border: '1px solid #74b9ff' }}>
                <h5 className="font-semibold mb-3" style={{ color: '#74b9ff' }}>Original Recipe</h5>
                <div className="space-y-2">
                  {selectedRecipe.originalIngredients?.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#2d3436', color: '#ffffff' }}>
                      <span className="font-medium" style={{ color: '#ffffff' }}>{ing.name}</span>
                      <span className="text-sm" style={{ color: '#b2bec3' }}>{ing.quantity} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4" style={{ backgroundColor: '#636e72', border: '1px solid #ff6b35' }}>
                <h5 className="font-semibold mb-3" style={{ color: '#ff6b35' }}>Adjusted Recipe</h5>
                <div className="space-y-2">
                  {selectedRecipe.adjustedIngredients?.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#2d3436', color: '#ffffff' }}>
                      <span className="font-medium" style={{ color: '#ffffff' }}>{ing.name}</span>
                      <div className="text-sm">
                        <span className="line-through mr-2" style={{ color: '#95a5a6' }}>{ing.originalQuantity}</span>
                        <span className="font-semibold" style={{ color: '#ff6b35' }}>{ing.adjustedQuantity} {ing.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdjustedRecipes;