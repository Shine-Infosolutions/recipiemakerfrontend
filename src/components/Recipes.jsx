import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdPerson, MdTimer, MdRestaurantMenu, MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [cookQuantities, setCookQuantities] = useState({});
  const [formData, setFormData] = useState({ title: '', instructions: '', cookTime: '', servings: '', ingredients: [] });

  useEffect(() => {
    fetchRecipes();
    fetchInventory();
    fetchRawMaterials();
  }, []);

  // Show only raw materials as recipes
  const allRecipes = rawMaterials.map(rm => ({
    _id: rm._id,
    title: rm.recipeName + (rm.variation ? ` (${rm.variation})` : ''),
    ingredients: rm.ingredients,
    isFromRawMaterial: true
  }));

  const fetchRawMaterials = async () => {
    const res = await fetch(`${API_URL}/rawmaterials`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setRawMaterials(data);
  };

  const fetchRecipes = async () => {
    const res = await fetch(`${API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setRecipes(data);
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
    if (formData.title && formData.ingredients.length > 0) {
      await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      setFormData({ title: '', instructions: '', cookTime: '', servings: '', ingredients: [] });
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
      
      if (isFromRawMaterial) {
        const rm = rawMaterials.find(r => r._id === id);
        if (!rm) {
          alert('Recipe not found');
          return;
        }
        
        const createRes = await fetch(`${API_URL}/recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            title: rm.recipeName + (rm.variation ? ` (${rm.variation})` : ''),
            quantity: quantity,
            ingredients: rm.ingredients.map(ing => ({
              inventoryId: ing.inventoryId._id,
              quantity: ing.quantity * quantity,
              unit: ing.inventoryId.unit
            }))
          })
        });
        
        const newRecipe = await createRes.json();
        if (!createRes.ok) {
          alert(newRecipe.error || 'Failed to create recipe');
          return;
        }
        
        const res = await fetch(`${API_URL}/recipes/${newRecipe._id}/cook`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to cook recipe');
          return;
        }
        
        alert(`${quantity} recipe(s) cooked successfully!`);
        await fetchRecipes();
        await fetchInventory();
        setCookQuantities({ ...cookQuantities, [id]: 1 });
      }
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
            onClick={() => setShowForm(!showForm)}
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
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              marginBottom: '24px',
              border: '1px solid #e9ecef'
            }}
          >
            <h3 style={{ marginTop: 0, color: '#2d3436', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              <MdPerson /> Create New Recipe
            </h3>
            
            {rawMaterials.length > 0 && (
              <select
                onChange={(e) => {
                  const rm = rawMaterials.find(r => r._id === e.target.value);
                  if (rm) {
                    setFormData({ 
                      ...formData, 
                      title: rm.recipeName,
                      ingredients: rm.ingredients.map(ing => ({
                        inventoryId: ing.inventoryId._id,
                        quantity: ing.quantity,
                        unit: ing.inventoryId.unit
                      }))
                    });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                <option value="">-- Select from raw materials --</option>
                {rawMaterials.map(rm => (
                  <option key={rm._id} value={rm._id}>{rm.recipeName}</option>
                ))}
              </select>
            )}
            
            <input
              type="text"
              placeholder="Recipe Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dfe6e9',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                outline: 'none'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="number"
                placeholder="Cook Time (min)"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <input
                type="number"
                placeholder="Servings"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                style={{
                  padding: '10px',
                  border: '1px solid #dfe6e9',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <textarea
              placeholder="Instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dfe6e9',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                minHeight: '70px',
                outline: 'none'
              }}
            />

            <h4 style={{ color: '#2d3436', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>
              <MdRestaurantMenu /> Ingredients
            </h4>
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                <select
                  value={ing.inventoryId}
                  onChange={(e) => updateIngredient(idx, 'inventoryId', e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Ingredient</option>
                  {inventory.map(item => (
                    <option key={item._id} value={item._id}>{item.name} ({item.quantity} {item.unit})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => removeIngredient(idx)}
                  style={{
                    padding: '8px 12px',
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <MdClose />
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '16px',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              <MdAdd /> Add Ingredient
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={createRecipe}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Create Recipe
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {allRecipes.map((recipe) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: '#2d3436', fontSize: '16px', fontWeight: '600' }}>
                <MdRestaurantMenu style={{ fontSize: '18px', color: '#667eea', verticalAlign: 'middle' }} /> {recipe.title}
              </h3>
              
              <div style={{ marginBottom: '12px', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                <strong style={{ color: '#2d3436', fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                  Ingredients:
                </strong>
                <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '12px', lineHeight: '1.6' }}>
                  {recipe.ingredients?.map((ing, idx) => {
                    const invItem = inventory.find(i => i._id === ing.inventoryId?._id);
                    const hasEnough = invItem && invItem.quantity >= ing.quantity;
                    return (
                      <li key={idx} style={{ color: hasEnough ? '#00b894' : '#ff4757', fontWeight: '500' }}>
                        {ing.inventoryId?.name || 'Unknown'} - {ing.quantity} {ing.unit}
                        {!hasEnough && ` ⚠️`}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {recipe.instructions && (
                <p style={{ color: '#636e72', fontSize: '12px', marginBottom: '10px', background: '#f8f9fa', padding: '8px', borderRadius: '6px', lineHeight: '1.5' }}>
                  <strong style={{ color: '#2d3436' }}>Instructions:</strong> {recipe.instructions}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#636e72', marginBottom: '12px', fontWeight: '500' }}>
                {recipe.cookTime && <span><MdTimer style={{ verticalAlign: 'middle' }} /> {recipe.cookTime} min</span>}
                {recipe.servings && <span><MdPerson style={{ verticalAlign: 'middle' }} /> {recipe.servings}</span>}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  value={cookQuantities[recipe._id] || 1}
                  onChange={(e) => setCookQuantities({ ...cookQuantities, [recipe._id]: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '60px',
                    padding: '10px 8px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => cookRecipe(recipe._id, recipe.isFromRawMaterial)}
                  disabled={!canCookRecipe(recipe) || cookingRecipe === recipe._id}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: canCookRecipe(recipe) && cookingRecipe !== recipe._id ? '#00b894' : '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: canCookRecipe(recipe) && cookingRecipe !== recipe._id ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: canCookRecipe(recipe) && cookingRecipe !== recipe._id ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {cookingRecipe === recipe._id ? <><GiCookingPot style={{ fontSize: '18px' }} /> Cooking...</> : <><GiCookingPot style={{ fontSize: '18px' }} /> Cook</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {allRecipes.length === 0 && !showForm && (
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
      </div>
    </>
  );
};

export default Recipes;
