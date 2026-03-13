import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdAdd, MdClose } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const ManualLossForm = ({ isOpen, onClose, onSuccess }) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [recipeTitle, setRecipeTitle] = useState('');
  const [originalQuantity, setOriginalQuantity] = useState(1);
  const [lossType, setLossType] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [lossValue, setLossValue] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
    }
  }, [isOpen]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleRecipeSelect = (recipeId) => {
    const recipe = recipes.find(r => r._id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipeId);
      setRecipeTitle(recipe.title);
      setLossValue(recipe.sellingPrice || 0);
      
      // Initialize ingredients with zero lost quantities
      const recipeIngredients = recipe.ingredients?.map(ing => ({
        inventoryId: ing.inventoryId,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        lostQuantity: 0
      })) || [];
      setIngredients(recipeIngredients);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!lossType.trim()) {
      toast.error('Please enter the type of loss');
      return;
    }
    
    if (!lossReason.trim()) {
      toast.error('Please enter the reason for loss');
      return;
    }

    setLoading(true);
    
    try {
      const lossData = {
        recipeId: selectedRecipe || undefined,
        recipeTitle: recipeTitle.trim(),
        originalQuantity: originalQuantity,
        lossType: lossType.trim(),
        lossReason: lossReason.trim(),
        lossValue: lossValue,
        ingredients: ingredients,
        notes: notes.trim()
      };

      const res = await fetch(`${API_URL}/losses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(lossData)
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Error: ${error.error || 'Failed to create loss record'}`);
        return;
      }

      toast.success('Loss record created successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRecipe('');
    setRecipeTitle('');
    setOriginalQuantity(1);
    setLossType('');
    setLossReason('');
    setLossValue(0);
    setIngredients([]);
    setNotes('');
    onClose();
  };

  const updateIngredientLostQuantity = (index, lostQuantity) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].lostQuantity = parseFloat(lostQuantity) || 0;
    setIngredients(updatedIngredients);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Manual Loss Entry</h3>
          <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">
            <MdClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipe Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Recipe (Optional)</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={selectedRecipe}
              onChange={(e) => handleRecipeSelect(e.target.value)}
            >
              <option value="">Select a recipe or enter manually below</option>
              {recipes.map(recipe => (
                <option key={recipe._id} value={recipe._id}>
                  {recipe.title}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Recipe Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Recipe/Item Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter recipe or item name"
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Original Quantity</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={originalQuantity}
                onChange={(e) => setOriginalQuantity(parseFloat(e.target.value) || 1)}
                min="0.1"
                step="0.1"
                required
              />
            </div>

            {/* Loss Value */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Loss Value (₹)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Enter monetary loss value"
                value={lossValue}
                onChange={(e) => setLossValue(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Loss Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Type of Loss</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter loss type (e.g., partial damage, complete spoilage, half burnt, etc.)"
              value={lossType}
              onChange={(e) => setLossType(e.target.value)}
              required
            />
          </div>

          {/* Loss Reason */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Reason for Loss</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Describe the reason for loss (e.g., left on stove too long, power outage, ingredient expired, etc.)"
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Ingredient Loss Details</span>
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="card bg-base-200 p-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="font-semibold text-sm">{ing.name}</span>
                        <div className="text-xs text-gray-600 mt-1">
                          Total: {ing.quantity} {ing.unit}
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Lost Quantity</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-24"
                          value={ing.lostQuantity}
                          onChange={(e) => updateIngredientLostQuantity(idx, e.target.value)}
                          min="0"
                          max={ing.quantity}
                          step="0.1"
                          placeholder="0"
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium min-w-[3rem]">
                        {ing.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Additional Notes (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Any additional notes about the loss..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Loss Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualLossForm;