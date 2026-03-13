import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const InProgress = () => {
  const [cookingItems, setCookingItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [lossType, setLossType] = useState(''); // Free text input for loss type
  const [lossReason, setLossReason] = useState(''); // Free text input for loss reason
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showRemakeModal, setShowRemakeModal] = useState(false);
  const [remakeDecision, setRemakeDecision] = useState(null); // 'yes' or 'no'

  useEffect(() => {
    fetchCookingItems();
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

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
      console.log('All cooking items:', data);
      const cookingItems = data.filter(item => item.status === 'cooking');
      console.log('Cooking items:', cookingItems);
      setCookingItems(cookingItems);
    } catch (error) {
      console.error('Error:', error);
      setCookingItems([]);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/cooked-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: status === 'finished' ? 'finished' : status === 'loss' ? 'loss' : 'semi-finished' })
      });
      
      if (!res.ok) {
        const error = await res.json();
        toast.error(`Error: ${error.error || 'Failed to update status'}`);
        return;
      }
      
      fetchCookingItems();
      toast.success(`Item marked as ${status === 'finished' ? 'finished' : status === 'loss' ? 'loss' : 'semi-finished'}!`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const openRestockModal = (item) => {
    setSelectedItem(item);
    // Extract only the inventoryId strings, not the whole ingredient object
    const ingredientIds = item.ingredients.map(ing => 
      typeof ing.inventoryId === 'string' ? ing.inventoryId : ing.inventoryId._id || ing.inventoryId.toString()
    );
    setSelectedIngredients(ingredientIds);
    
    // Initialize quantities with original amounts
    const quantities = {};
    item.ingredients.forEach(ing => {
      const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
      quantities[ingId] = ing.quantity;
    });
    setIngredientQuantities(quantities);
    
    setShowRestockModal(true);
  };

  const openLossModal = (item) => {
    setSelectedItem(item);
    setLossType(''); // Reset to empty for keyboard input
    setLossReason(''); // Reset loss reason description
    // Initialize quantities with original amounts (not 0)
    const quantities = {};
    item.ingredients.forEach(ing => {
      const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
      quantities[ingId] = ing.quantity; // Show original quantity as default
    });
    setIngredientQuantities(quantities);
    setSelectedIngredients([]);
    setShowLossModal(true);
  };

  const confirmLoss = async () => {
    try {
      if (!lossType.trim()) {
        toast.error('Please enter the type of loss');
        return;
      }

      if (!lossReason.trim()) {
        toast.error('Please provide a reason for the loss');
        return;
      }

      // Check if any ingredients have lost quantities > 0
      const hasLostIngredients = Object.values(ingredientQuantities).some(qty => qty > 0);
      if (!hasLostIngredients) {
        toast.error('Please enter lost quantities for at least one ingredient');
        return;
      }

      // Show confirmation modal before proceeding
      setShowConfirmationModal(true);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const proceedWithLoss = async (decision = null) => {
    try {
      const finalDecision = decision || remakeDecision;
      
      const lossData = {
        cookedItemId: selectedItem._id,
        lossType: lossType.trim(),
        lossReason: lossReason.trim(),
        lostQuantities: ingredientQuantities,
        remakeWithFreshIngredients: finalDecision === 'yes'
      };

      const res = await fetch(`${API_URL}/losses/from-cooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(lossData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        toast.error(`Error: ${error.error || 'Failed to record loss'}`);
        return;
      }
      
      setShowLossModal(false);
      setShowConfirmationModal(false);
      setShowRemakeModal(false);
      setSelectedItem(null);
      setSelectedIngredients([]);
      setIngredientQuantities({});
      setLossReason('');
      setRemakeDecision(null);
      fetchCookingItems();
      
      if (finalDecision === 'yes') {
        toast.success(`Loss recorded and fresh ingredients automatically used to restart cooking!`);
      } else {
        toast.success(`Loss recorded successfully.`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };
  const confirmSemiFinished = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Please select at least one ingredient to restock');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/cooked-items/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'semi-finished',
          restockedIngredients: selectedIngredients,
          ingredientQuantities: ingredientQuantities
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        toast.error(`Error: ${error.error || 'Failed to update status'}`);
        return;
      }
      
      setShowRestockModal(false);
      setSelectedItem(null);
      setSelectedIngredients([]);
      setIngredientQuantities({});
      fetchCookingItems();
      toast.success('Ingredients restocked successfully!');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <div style={{ 
        marginTop: window.innerWidth < 768 ? '0px' : '0px',
        padding: window.innerWidth < 768 ? '15px' : '30px',
        background: '#f8f9fa',
        minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GiCookingPot style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Cooking
          </h1>
          {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Items currently being cooked</p>}
        </div>
        {loading ? <Loading /> : (
        <>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table">
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ color: '#2d3436', padding: '16px' }}>Recipe Name</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Quantity</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Total Value</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Ingredients</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Date</th>
                <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cookingItems.map((item) => {
                const recipe = recipes.find(r => r._id === item.recipeId);
                const totalValue = (recipe?.sellingPrice || 0) * item.quantity;
                return (
                <tr key={item._id} style={{ borderBottom: '1px solid #e9ecef' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>{item.title}</td>
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
                      <button onClick={() => openRestockModal(item)} style={{ padding: '8px 12px', background: '#ffa502', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        Semi-Finished
                      </button>
                      <button onClick={() => openLossModal(item)} style={{ padding: '8px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        Loss
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {cookingItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><GiCookingPot /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No items cooking</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Go to Recipes page to start cooking!</p>
          </motion.div>
        )}
        </>
        )}
      </div>

      {showRestockModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Select Ingredients to Restock
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which ingredients to restock to inventory and adjust quantities:
            </p>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {selectedItem.ingredients?.map((ing, idx) => {
                const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                return (
                  <div key={idx} className="card bg-base-200 p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedIngredients.includes(ingId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIngredients([...selectedIngredients, ingId]);
                          } else {
                            setSelectedIngredients(selectedIngredients.filter(id => id !== ingId));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-base">
                          {ing.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Quantity</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-20"
                          value={ingredientQuantities[ingId] || ing.quantity}
                          onChange={(e) => {
                            setIngredientQuantities({
                              ...ingredientQuantities,
                              [ingId]: parseFloat(e.target.value) || 0
                            });
                          }}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium min-w-[3rem]">
                        {ing.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowRestockModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={confirmSemiFinished}
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {showLossModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Record Loss for Recipe
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the type of loss and reason using keyboard input:
            </p>
            
            {/* Loss Type Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold">Type of Loss</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter loss type (e.g., partial damage, complete spoilage, half burnt, etc.)"
                value={lossType}
                onChange={(e) => setLossType(e.target.value)}
              />
            </div>

            {/* Loss Reason Input */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-semibold">Reason for Loss</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Describe the reason for loss (e.g., left on stove too long, power outage, ingredient expired, etc.)"
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                rows={3}
              />
            </div>

            {/* Ingredient Loss Quantities */}
            <div className="mb-6">
              <label className="label">
                <span className="label-text font-semibold">Enter Lost Quantities for Each Ingredient</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Enter the quantity lost for each ingredient (enter 0 if ingredient was not lost):
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedItem.ingredients?.map((ing, idx) => {
                  const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                  return (
                    <div key={idx} className="card bg-base-200 p-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <span className="font-semibold text-sm">
                            {ing.name || 'Unknown'}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            Available: {ing.quantity} {ing.unit}
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text text-xs">Lost Quantity</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered input-sm w-24"
                            value={ingredientQuantities[ingId] || ing.quantity}
                            onChange={(e) => {
                              setIngredientQuantities({
                                ...ingredientQuantities,
                                [ingId]: parseFloat(e.target.value) || 0
                              });
                            }}
                            min="0"
                            max={ing.quantity}
                            step="0.1"
                            placeholder={ing.quantity.toString()}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium min-w-[3rem]">
                          {ing.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowLossModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmLoss}
              >
                Record Loss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4 text-warning">
              ⚠️ Confirm Loss
            </h3>
            
            <div className="space-y-4">
              <div className="alert alert-info">
                <div>
                  <h4 className="font-semibold">What will happen:</h4>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Record loss: "{lossType}"</li>
                    <li>• Lost ingredients remain consumed (wasted/lost)</li>
                    <li>• The cooking item will be updated based on loss</li>
                    <li>• You can cook replacement ingredients from Recipes page if needed</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-200 p-4">
                <h5 className="font-semibold mb-2">Ingredients that will remain consumed (lost):</h5>
                <div className="space-y-2">
                  {selectedItem.ingredients?.filter(ing => {
                    const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                    return (ingredientQuantities[ingId] || 0) > 0;
                  }).map((ing, idx) => {
                    const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                    const quantity = (ingredientQuantities[ingId] || 0) * selectedItem.quantity;
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{ing.name}</span>
                        <span className="font-medium">{quantity} {ing.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Loss Reason:</strong> {lossReason}
                </p>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowConfirmationModal(false)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={() => setShowRemakeModal(true)}
              >
                Confirm Loss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remake Decision Modal */}
      {showRemakeModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4 text-primary">
              🍳 Use Fresh Ingredients?
            </h3>
            
            <div className="space-y-4">
              <div className="alert alert-warning">
                <div>
                  <p className="text-sm">
                    The ingredients are spoiled/lost. Do you want to automatically use fresh ingredients from inventory to {lossType === 'complete' ? 'remake the entire recipe' : 'replace the lost ingredients'}?
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 p-4">
                <h5 className="font-semibold mb-2">Fresh ingredients needed from inventory:</h5>
                <div className="space-y-2">
                  {selectedItem.ingredients?.filter(ing => {
                    const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                    return (ingredientQuantities[ingId] || 0) > 0;
                  }).map((ing, idx) => {
                    const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                    const quantity = ingredientQuantities[ingId] || 0;
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{ing.name}</span>
                        <span className="font-medium text-primary">{quantity} {ing.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-success flex-1"
                  onClick={() => {
                    proceedWithLoss('yes');
                  }}
                >
                  ✅ Yes, Use Fresh Ingredients
                </button>
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    proceedWithLoss('no');
                  }}
                >
                  ❌ No, Just Record Loss
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowRemakeModal(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InProgress;
