import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdPerson, MdTimer, MdRestaurantMenu, MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import Modal from '../common/Modal';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [cookQuantities, setCookQuantities] = useState({});
  const [showCookModal, setShowCookModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState({ title: '', instructions: '', cookTime: '', servings: '', ingredients: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
    fetchInventory();
  }, []);

  // Show recipes from the recipes API
  const allRecipes = recipes.filter(r => !r.status || r.status === 'cooking').map(r => ({
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

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { inventoryId: '', quantity: '', unit: '' }]
    });
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    if (field === 'inventoryId') {
      const item = inventory.find(i => i._id === value);
      if (item) updated[index].unit = item.unit;
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
    if (formData.title && formData.ingredients.length > 0 && formData.ingredients.every(ing => ing.inventoryId && ing.quantity)) {
      await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          ingredients: formData.ingredients.map(ing => ({
            inventoryId: ing.inventoryId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit
          }))
        })
      });
      setFormData({ title: '', instructions: '', cookTime: '', servings: '', ingredients: [{ inventoryId: '', quantity: '', unit: '' }] });
      setShowForm(false);
      fetchRecipes();
      fetchInventory();
    }
  };

  const canCookRecipe = (recipe) => {
    return recipe.ingredients?.every(ing => {
      const invItem = inventory.find(i => i._id === ing.inventoryId?._id);
      return invItem && invItem.quantity >= ing.quantity;
    });
  };

  const cookRecipe = async (id, isFromRawMaterial) => {
    try {
      setCookingRecipe(id);
      const quantity = cookQuantities[id] || 1;
      
      const recipe = recipes.find(r => r._id === id);
      if (!recipe) {
        alert('Recipe not found');
        return;
      }
      
      // Create cooked item
      const res = await fetch(`${API_URL}/cooked-items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          recipeId: id,
          quantity: quantity
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cook recipe');
        return;
      }
      
      alert(`Recipe cooked successfully!`);
      await fetchRecipes();
      await fetchInventory();
      setCookQuantities({ ...cookQuantities, [id]: 1 });
    } catch (error) {
      alert('Error cooking recipe: ' + error.message);
    } finally {
      setCookingRecipe(null);
    }
  };

  const deleteRecipe = async (id) => {
    await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchRecipes();
  };

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
              <MdRestaurant style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Recipes</span>
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Create and manage your recipes</p>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm);
              setFormData({ title: '', instructions: '', cookTime: '', servings: '', ingredients: [{ inventoryId: '', quantity: '', unit: '' }] });
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
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            + Add Recipe
          </motion.button>
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
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Recipe">
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>Recipe Name</label>
              <input
                type="text"
                placeholder="Enter recipe name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  color: '#2d3436',
                  background: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#2d3436' }}>Ingredients</label>
                <button
                  onClick={addIngredient}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(102,126,234,0.3)'
                  }}
                >
                  <MdAdd style={{ fontSize: '16px' }} /> Add Ingredient
                </button>
              </div>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} style={{ 
                    background: '#f8f9fa', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '10px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#667eea' }}>Ingredient {index + 1}</span>
                      {formData.ingredients.length > 1 && (
                        <button
                          onClick={() => removeIngredient(index)}
                          style={{
                            padding: '4px 8px',
                            background: '#ff4757',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <MdClose style={{ fontSize: '14px' }} /> Remove
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#636e72', marginBottom: '4px' }}>Select Item</label>
                        <select
                          value={ingredient.inventoryId}
                          onChange={(e) => updateIngredient(index, 'inventoryId', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #dfe6e9',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer',
                            background: 'white',
                            color: '#2d3436'
                          }}
                        >
                          <option value="">Choose ingredient...</option>
                          {inventory.map(inv => (
                            <option key={inv._id} value={inv._id}>{inv.name} ({inv.quantity} {inv.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#636e72', marginBottom: '4px' }}>Quantity</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #dfe6e9',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none',
                            background: 'white',
                            color: '#2d3436'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
              <button
                onClick={createRecipe}
                disabled={!formData.title || formData.ingredients.length === 0 || !formData.ingredients.every(ing => ing.inventoryId && ing.quantity)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: formData.title && formData.ingredients.length > 0 && formData.ingredients.every(ing => ing.inventoryId && ing.quantity) 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: formData.title && formData.ingredients.length > 0 && formData.ingredients.every(ing => ing.inventoryId && ing.quantity) ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                  opacity: formData.title && formData.ingredients.length > 0 && formData.ingredients.every(ing => ing.inventoryId && ing.quantity) ? 1 : 0.6
                }}
              >
                Save Recipe
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', instructions: '', cookTime: '', servings: '', ingredients: [{ inventoryId: '', quantity: '', unit: '' }] });
                }}
                style={{
                  padding: '12px 20px',
                  background: '#e9ecef',
                  color: '#2d3436',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showCookModal} onClose={() => setShowCookModal(false)} title="Cook Recipe">
          {selectedRecipe && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2d3436' }}>
                {selectedRecipe.title}
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>
                  Quantity to Cook:
                </label>
                <input
                  type="number"
                  min="1"
                  value={cookQuantities[selectedRecipe._id] || 1}
                  onChange={(e) => setCookQuantities({ ...cookQuantities, [selectedRecipe._id]: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowCookModal(false);
                    cookRecipe(selectedRecipe._id, selectedRecipe.isFromRawMaterial);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #00b894 0%, #00a383 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <GiCookingPot style={{ fontSize: '18px' }} /> Cook Now
                </button>
                <button
                  onClick={() => setShowCookModal(false)}
                  style={{
                    padding: '12px 20px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f3f5' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Recipe Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Ingredients</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allRecipes.map((recipe) => {
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
                      <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
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
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#636e72', background: '#f8f9fa', padding: '6px 12px', borderRadius: '12px', fontWeight: '600', display: 'inline-block' }}>
                          Available
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedRecipe(recipe);
                            setCookQuantities({ ...cookQuantities, [recipe._id]: 1 });
                            setShowCookModal(true);
                          }}
                          disabled={!canCookRecipe(recipe) || cookingRecipe === recipe._id}
                          style={{
                            padding: '8px 16px',
                            background: canCookRecipe(recipe) && cookingRecipe !== recipe._id ? '#00b894' : '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: canCookRecipe(recipe) && cookingRecipe !== recipe._id ? 'pointer' : 'not-allowed',
                            fontWeight: '600',
                            fontSize: '13px',
                            opacity: canCookRecipe(recipe) && cookingRecipe !== recipe._id ? 1 : 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            margin: '0 auto',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {cookingRecipe === recipe._id ? <><GiCookingPot style={{ fontSize: '16px' }} /> Cooking...</> : <><GiCookingPot style={{ fontSize: '16px' }} /> Cook</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {allRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', maxWidth: '500px', margin: '60px auto' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}><MdRestaurant /></div>
            <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>No recipes yet</p>
            <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>Click "Add Recipe" to create your first recipe!</p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </>
  );
};

export default Recipes;
