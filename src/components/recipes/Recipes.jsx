import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdRestaurant, MdPerson, MdTimer, MdRestaurantMenu, MdClose, MdAdd, MdDelete, MdEdit, MdMoreVert } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import { useDepartments } from '../../contexts/DepartmentContext';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [semiFinishedItems, setSemiFinishedItems] = useState([]);
  const { departments } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [cookQuantities, setCookQuantities] = useState({});
  const [showCookModal, setShowCookModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [adjustedIngredients, setAdjustedIngredients] = useState([]);
  const [formData, setFormData] = useState({ title: '', departmentId: '', instructions: '', cookTime: '', servings: '', sellingPrice: '', ingredients: [{ type: 'raw', inventoryId: '', quantity: '', unit: '' }] });
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Staff');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchRecipes();
    fetchInventory();
    fetchSemiFinishedItems();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (userRole === 'Admin') {
      // Admin can filter by department or see all
      if (selectedDepartment) {
        setFilteredRecipes(recipes.filter(recipe => recipe.departmentId?._id === selectedDepartment));
      } else {
        setFilteredRecipes(recipes);
      }
    } else {
      // Non-admin users see only their department's recipes
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.departmentId) {
            setFilteredRecipes(recipes.filter(recipe => recipe.departmentId?._id === payload.departmentId));
          } else {
            setFilteredRecipes(recipes);
          }
        } catch (error) {
          setFilteredRecipes(recipes);
        }
      } else {
        setFilteredRecipes(recipes);
      }
    }
  }, [recipes, selectedDepartment, userRole]);

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen({});
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Show all recipes as templates for cooking
  const allRecipes = filteredRecipes.map(r => ({
    _id: r._id,
    title: r.title,
    ingredients: r.ingredients,
    isFromRawMaterial: false
  }));

  const fetchRecipes = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setRecipes(data);
    setLoading(false);
  };

  const fetchInventory = async () => {
    const res = await fetch(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setInventory(data);
  };

  const fetchSemiFinishedItems = async () => {
    try {
      const res = await fetch(`${API_URL}/semi-finished`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSemiFinishedItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching semi-finished items:', error);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { type: 'raw', inventoryId: '', quantity: '', unit: '' }]
    });
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    if (field === 'inventoryId') {
      if (updated[index].type === 'raw') {
        const item = inventory.find(i => i._id === value);
        if (item) updated[index].unit = item.unit;
      } else {
        const item = semiFinishedItems.find(i => i._id === value);
        if (item) updated[index].unit = 'units';
      }
    }
    setFormData({ ...formData, ingredients: updated });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const createRecipe = async () => {
    if (formData.title && formData.departmentId && formData.ingredients.length > 0 && formData.ingredients.every(ing => ing.inventoryId && ing.quantity)) {
      const url = editingId ? `${API_URL}/recipes/${editingId}` : `${API_URL}/recipes`;
      const method = editingId ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          departmentId: formData.departmentId,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          ingredients: formData.ingredients.map(ing => ({
            type: ing.type || 'raw',
            inventoryId: ing.inventoryId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit
          }))
        })
      });
      setFormData({ title: '', departmentId: '', instructions: '', cookTime: '', servings: '', sellingPrice: '', ingredients: [{ type: 'raw', inventoryId: '', quantity: '', unit: '' }] });
      setEditingId(null);
      setShowForm(false);
      fetchRecipes();
      fetchInventory();
      fetchSemiFinishedItems();
      toast.success(editingId ? 'Recipe updated successfully!' : 'Recipe created successfully!');
    } else {
      toast.error('Please fill in all required fields including department');
    }
  };

  const canCookRecipe = (recipe) => {
    return recipe.ingredients?.every(ing => {
      if (ing.type === 'semi-finished') {
        const sfItem = semiFinishedItems.find(i => i._id === ing.inventoryId?._id);
        return sfItem && sfItem.quantity >= ing.quantity;
      }
      const invItem = inventory.find(i => i._id === ing.inventoryId?._id);
      return invItem && invItem.quantity >= ing.quantity;
    });
  };

  const cookRecipe = async (id, isFromRawMaterial, useAdjustedIngredients = false) => {
    try {
      setCookingRecipe(id);
      const quantity = cookQuantities[id] || 1;
      
      const recipe = recipes.find(r => r._id === id);
      if (!recipe) {
        toast.error('Recipe not found');
        return;
      }
      
      // Use adjusted ingredients if provided, otherwise use original recipe ingredients
      let ingredientsToUse;
      if (useAdjustedIngredients && adjustedIngredients.length > 0) {
        // Map adjusted ingredients to use the adjustedQuantity as the actual quantity
        ingredientsToUse = adjustedIngredients.map(ing => ({
          ...ing,
          quantity: ing.adjustedQuantity // Use the adjusted quantity for cooking
        }));
      } else {
        ingredientsToUse = recipe.ingredients;
      }
      
      // Create cooking item in separate collection
      const sourceRecipe = recipes.find(r => r._id === id);
      const res = await fetch(`${API_URL}/cooked-items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          recipeId: id,
          title: sourceRecipe.title,
          ingredients: ingredientsToUse,
          quantity: quantity,
          status: 'cooking',
          startedAt: new Date().toISOString(),
          isAdjusted: useAdjustedIngredients
        })
      });
      const data = await res.json();
      console.log('Cook response:', data);
      console.log('Response status:', res.status);
      if (!res.ok) {
        console.error('Cook failed:', data);
        toast.error(data.error || 'Failed to cook recipe');
        return;
      }
      
      // Check if status was actually updated
      if (data.status !== 'cooking') {
        console.warn('Status not updated to cooking:', data.status);
      }
      
      alert(`Recipe cooked successfully!`);
      toast.success(`Recipe "${sourceRecipe.title}" is now cooking!`);
      await fetchRecipes();
      await fetchInventory();
      await fetchSemiFinishedItems();
      setCookQuantities({ ...cookQuantities, [id]: 1 });
      
      // Reset adjusted ingredients after cooking
      if (useAdjustedIngredients) {
        setAdjustedIngredients([]);
      }
    } catch (error) {
      toast.error('Error cooking recipe: ' + error.message);
    } finally {
      setCookingRecipe(null);
    }
  };

  const openAdjustModal = (recipe) => {
    setSelectedRecipe(recipe);
    // Initialize adjusted ingredients with original recipe quantities
    setAdjustedIngredients(recipe.ingredients.map(ing => ({
      ...ing,
      adjustedQuantity: ing.quantity
    })));
    setShowAdjustModal(true);
  };

  const updateAdjustedQuantity = (index, newQuantity) => {
    const updated = [...adjustedIngredients];
    updated[index].adjustedQuantity = parseFloat(newQuantity) || 0;
    // Keep the original quantity for reference, but use adjustedQuantity for cooking
    setAdjustedIngredients(updated);
  };

  const canCookWithAdjustedIngredients = () => {
    return adjustedIngredients.every(ing => {
      if (ing.type === 'semi-finished') {
        const sfItem = semiFinishedItems.find(i => i._id === ing.inventoryId?._id);
        return sfItem && sfItem.quantity >= ing.adjustedQuantity;
      }
      const invItem = inventory.find(i => i._id === ing.inventoryId?._id);
      return invItem && invItem.quantity >= ing.adjustedQuantity;
    });
  };

  const deleteRecipe = async (id) => {
    await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchRecipes();
  };

  const toggleRecipeStatus = async (id) => {
    try {
      await fetch(`${API_URL}/recipes/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRecipes();
    } catch (error) {
      console.error('Error toggling recipe status:', error);
    }
  };

  const editRecipe = (recipe) => {
    setFormData({
      title: recipe.title,
      departmentId: recipe.departmentId?._id || '',
      instructions: recipe.instructions || '',
      cookTime: recipe.cookTime || '',
      servings: recipe.servings || '',
      sellingPrice: recipe.sellingPrice || '',
      ingredients: recipe.ingredients.map(ing => ({
        type: ing.type || 'raw',
        inventoryId: ing.inventoryId?._id || '',
        quantity: ing.quantity,
        unit: ing.unit
      }))
    });
    setEditingId(recipe._id);
    setShowForm(true);
  };

  // Pagination logic
  const totalItems = allRecipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = allRecipes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, allRecipes.length]);

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
              <MdRestaurant style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Recipes
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Create and manage your recipes</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {userRole === 'Admin' && (
              <select
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minWidth: '150px',
                  color: '#2d3436'
                }}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm(!showForm);
                setFormData({ title: '', departmentId: '', instructions: '', cookTime: '', servings: '', sellingPrice: '', ingredients: [{ type: 'raw', inventoryId: '', quantity: '', unit: '' }] });
              }}
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
                whiteSpace: 'nowrap'
              }}
            >
              + Add Recipe
            </motion.button>
          </div>
        </div>
        {loading ? <Loading /> : (
        <>
        {showForm && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg mb-4">
                <MdRestaurant className="inline mr-2" /> {editingId ? 'Edit Recipe' : 'Add Recipe'}
              </h3>
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Recipe Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter recipe name"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Department *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Selling Price (₹)</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter selling price"
                  className="input input-bordered"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                />
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">Ingredients</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={addIngredient}
                  >
                    <MdAdd className="text-base" /> Add Ingredient
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-4">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="card bg-base-200 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="badge badge-primary">Ingredient {index + 1}</span>
                        {formData.ingredients.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-error"
                            onClick={() => removeIngredient(index)}
                          >
                            <MdClose className="text-base" /> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Type</span>
                          </label>
                          <select
                            className="select select-bordered"
                            value={ingredient.type || 'raw'}
                            onChange={(e) => {
                              updateIngredient(index, 'type', e.target.value);
                              updateIngredient(index, 'inventoryId', ''); // Reset selection
                            }}
                          >
                            <option value="raw">Raw Material</option>
                            <option value="semi-finished">Semi-Finished</option>
                          </select>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Select Item</span>
                          </label>
                          <select
                            className="select select-bordered"
                            value={ingredient.inventoryId}
                            onChange={(e) => updateIngredient(index, 'inventoryId', e.target.value)}
                          >
                            <option value="">Choose {(ingredient.type || 'raw') === 'raw' ? 'raw material' : 'semi-finished item'}...</option>
                            {(ingredient.type || 'raw') === 'raw' 
                              ? inventory.map(inv => (
                                  <option key={inv._id} value={inv._id}>
                                    {inv.name} (Available: {inv.quantity} {inv.unit})
                                  </option>
                                ))
                              : semiFinishedItems.map(sf => (
                                  <option key={sf._id} value={sf._id}>
                                    {sf.name} (Available: {sf.quantity || 0} units)
                                  </option>
                                ))
                            }
                          </select>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Quantity</span>
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="Enter quantity"
                              className="input input-bordered flex-1"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                            />
                            <span className="bg-base-300 px-3 py-2 text-sm font-medium">
                              {ingredient.unit || 'unit'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ title: '', departmentId: '', instructions: '', cookTime: '', servings: '', sellingPrice: '', ingredients: [{ type: 'raw', inventoryId: '', quantity: '', unit: '' }] });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={createRecipe}
                  disabled={!formData.title || !formData.departmentId || formData.ingredients.length === 0 || !formData.ingredients.every(ing => ing.inventoryId && ing.quantity)}
                >
                  {editingId ? 'Update Recipe' : 'Save Recipe'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAdjustModal && selectedRecipe && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg mb-4">
                <MdEdit className="inline mr-2" /> Adjust Recipe Quantities
              </h3>
              <div className="mb-4">
                <h4 className="text-base font-semibold mb-3">{selectedRecipe.title}</h4>
                <p className="text-sm text-gray-600 mb-4">Adjust ingredient quantities for this specific order:</p>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                {adjustedIngredients.map((ingredient, index) => {
                  const invItem = inventory.find(i => i._id === ingredient.inventoryId?._id);
                  const hasEnough = invItem && invItem.quantity >= ingredient.adjustedQuantity;
                  
                  return (
                    <div key={index} className="card bg-base-200 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="font-semibold text-base">{ingredient.inventoryId?.name || 'Unknown'}</span>
                          <div className="text-sm text-gray-600">
                            Available: {invItem?.quantity || 0} {ingredient.unit}
                          </div>
                        </div>
                        <div className={`badge ${hasEnough ? 'badge-success' : 'badge-error'}`}>
                          {hasEnough ? 'Available' : 'Insufficient'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Original Quantity</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={`${ingredient.quantity} ${ingredient.unit}`}
                            disabled
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Adjusted Quantity</span>
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              className={`input input-bordered flex-1 ${!hasEnough ? 'input-error' : ''}`}
                              value={ingredient.adjustedQuantity}
                              onChange={(e) => updateAdjustedQuantity(index, e.target.value)}
                            />
                            <span className="bg-base-300 px-3 py-2 text-sm font-medium">{ingredient.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Recipe Status:</span>
                  <div className={`badge ${canCookWithAdjustedIngredients() ? 'badge-success' : 'badge-error'}`}>
                    {canCookWithAdjustedIngredients() ? 'Ready to Cook' : 'Insufficient Ingredients'}
                  </div>
                </div>
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustedIngredients([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning mr-2"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setShowCookModal(true);
                  }}
                  disabled={!canCookWithAdjustedIngredients()}
                >
                  Continue to Cook
                </button>
              </div>
            </div>
          </div>
        )}
        {showCookModal && selectedRecipe && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                <GiCookingPot className="inline mr-2" /> Cook Recipe
              </h3>
              <div className="mb-4">
                <h4 className="text-base font-semibold mb-3">{selectedRecipe.title}</h4>
                <div className="bg-base-200 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Selling Price per unit:</span>
                    <span className="font-semibold text-blue-600">₹{recipes.find(r => r._id === selectedRecipe._id)?.sellingPrice || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="font-semibold text-green-600">₹{((recipes.find(r => r._id === selectedRecipe._id)?.sellingPrice || 0) * (cookQuantities[selectedRecipe._id] || 1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Quantity to Cook</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered text-center"
                  value={cookQuantities[selectedRecipe._id] || 1}
                  onChange={(e) => setCookQuantities({ ...cookQuantities, [selectedRecipe._id]: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCookModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    setShowCookModal(false);
                    const useAdjusted = adjustedIngredients.length > 0;
                    cookRecipe(selectedRecipe._id, selectedRecipe.isFromRawMaterial, useAdjusted);
                  }}
                >
                  <GiCookingPot className="text-base mr-1" /> Cook Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f3f5' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Recipe Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Department</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Ingredients</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Price</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Active</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecipes.map((recipe) => {
                  const originalRecipe = recipes.find(r => r._id === recipe._id);
                  return (
                    <tr
                      key={recipe._id}
                      style={{ borderBottom: '1px solid #e9ecef' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MdRestaurantMenu style={{ fontSize: '18px', color: '#667eea' }} />
                          {recipe.title}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {originalRecipe?.departmentId ? (
                          <span style={{ 
                            fontSize: '11px', 
                            color: '#667eea', 
                            background: '#e8ecff', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontWeight: '600' 
                          }}>
                            {originalRecipe.departmentId.name} ({originalRecipe.departmentId.code})
                          </span>
                        ) : (
                          <span style={{ color: '#ff4757', fontSize: '12px' }}>No Department</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {recipe.ingredients?.map((ing, idx) => {
                            const isSF = ing.type === 'semi-finished';
                            const item = isSF
                              ? semiFinishedItems.find(i => i._id === ing.inventoryId?._id)
                              : inventory.find(i => i._id === ing.inventoryId?._id);
                            const hasEnough = item && item.quantity >= ing.quantity;
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
                                {isSF && <span style={{ background: '#667eea', color: 'white', borderRadius: '3px', padding: '1px 4px', fontSize: '9px', marginRight: '3px' }}>SF</span>}
                                {ing.inventoryId?.name || 'Unknown'}: {ing.quantity}{ing.unit}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#00b894', fontWeight: '600' }}>
                          ₹{originalRecipe?.sellingPrice || 0}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#636e72', background: '#f8f9fa', padding: '6px 12px', borderRadius: '12px', fontWeight: '600', display: 'inline-block' }}>
                          Available
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div className="form-control">
                          <label className="label cursor-pointer justify-center">
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm" 
                              style={{
                                backgroundColor: originalRecipe?.isActive !== false ? '#10b981' : '#ef4444',
                                borderColor: originalRecipe?.isActive !== false ? '#10b981' : '#ef4444'
                              }}
                              checked={originalRecipe?.isActive !== false}
                              onChange={() => toggleRecipeStatus(recipe._id)}
                              disabled={userRole !== 'Admin'}
                            />
                          </label>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          {/* Temporarily show edit button for all users to test */}
                          <button
                            onClick={() => editRecipe(originalRecipe)}
                            style={{
                              padding: '6px 12px',
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
                            <MdEdit style={{ fontSize: '14px' }} /> Edit
                          </button>
                          
                          <button
                            onClick={() => openAdjustModal(recipe)}
                            disabled={originalRecipe?.isActive === false}
                            style={{
                              padding: '6px 12px',
                              background: originalRecipe?.isActive !== false ? '#ffa502' : '#95a5a6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: originalRecipe?.isActive !== false ? 'pointer' : 'not-allowed',
                              fontWeight: '600',
                              fontSize: '12px',
                              opacity: originalRecipe?.isActive !== false ? 1 : 0.6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MdEdit style={{ fontSize: '14px' }} /> Adjust
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setCookQuantities({ ...cookQuantities, [recipe._id]: 1 });
                              setShowCookModal(true);
                            }}
                            disabled={!canCookRecipe(recipe) || cookingRecipe === recipe._id || originalRecipe?.isActive === false}
                            style={{
                              padding: '6px 12px',
                              background: canCookRecipe(recipe) && cookingRecipe !== recipe._id && originalRecipe?.isActive !== false ? '#00b894' : '#95a5a6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: canCookRecipe(recipe) && cookingRecipe !== recipe._id && originalRecipe?.isActive !== false ? 'pointer' : 'not-allowed',
                              fontWeight: '600',
                              fontSize: '12px',
                              opacity: canCookRecipe(recipe) && cookingRecipe !== recipe._id && originalRecipe?.isActive !== false ? 1 : 0.6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {cookingRecipe === recipe._id ? <><GiCookingPot style={{ fontSize: '14px' }} /> Cooking...</> : <><GiCookingPot style={{ fontSize: '14px' }} /> Cook</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

        {allRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdRestaurant /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
              {selectedDepartment ? 'No recipes found for selected department' : 'No recipes yet'}
            </p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
              {selectedDepartment ? 'Try selecting a different department or add new recipes.' : 'Click "Add Recipe" to create your first recipe!'}
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default Recipes;
