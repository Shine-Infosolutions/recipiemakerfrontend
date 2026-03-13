import React, { useState } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const LossModal = ({ 
  isOpen, 
  onClose, 
  selectedItem, 
  onSuccess 
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [lossType, setLossType] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showRemakeModal, setShowRemakeModal] = useState(false);
  const [remakeDecision, setRemakeDecision] = useState(null);

  // Initialize quantities when modal opens
  React.useEffect(() => {
    if (isOpen && selectedItem) {
      // Initialize quantities with 0 (nothing lost by default)
      const quantities = {};
      selectedItem.ingredients.forEach(ing => {
        const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
        quantities[ingId] = 0; // Start with 0 lost quantity
      });
      setIngredientQuantities(quantities);
      setSelectedIngredients([]); // Start with no ingredients selected
      setLossType('');
      setLossReason('');
      setShowConfirmationModal(false);
      setShowRemakeModal(false);
      setRemakeDecision(null);
    }
  }, [isOpen, selectedItem]);

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

      // Check if any ingredients are selected and have lost quantities > 0
      const selectedIngredientsWithLoss = selectedIngredients.filter(ingId => 
        (ingredientQuantities[ingId] || 0) > 0
      );
      
      if (selectedIngredientsWithLoss.length === 0) {
        toast.error('Please select at least one ingredient that was lost and enter its lost quantity');
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
      
      // Check if this is a complete loss (all ingredients lost or single item recipe)
      const totalIngredients = selectedItem.ingredients.length;
      const lostIngredients = selectedIngredients.length;
      const isCompleteLoss = lostIngredients === totalIngredients || selectedItem.quantity === 1;
      
      const lossData = {
        cookedItemId: selectedItem._id,
        lossType: lossType.trim(),
        lossReason: lossReason.trim(),
        lostQuantities: ingredientQuantities,
        remakeWithFreshIngredients: finalDecision === 'yes',
        isCompleteLoss: isCompleteLoss && finalDecision === 'no' // Mark as complete loss if not remaking
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
        toast.error(`Error: ${error.error || 'Failed to record loss'}`);;
        return;
      }
      
      // Close all modals and reset state
      setShowConfirmationModal(false);
      setShowRemakeModal(false);
      setSelectedIngredients([]);
      setIngredientQuantities({});
      setLossReason('');
      setLossType('');
      setRemakeDecision(null);
      onClose();
      
      if (finalDecision === 'yes') {
        toast.success(`Loss recorded and fresh ingredients automatically used to restart cooking!`);
      } else if (isCompleteLoss) {
        toast.success(`Complete recipe loss recorded. Recipe removed from cooking.`);
      } else {
        toast.success(`Partial loss recorded successfully.`);
      }
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = () => {
    setShowConfirmationModal(false);
    setShowRemakeModal(false);
    setSelectedIngredients([]);
    setIngredientQuantities({});
    setLossReason('');
    setLossType('');
    setRemakeDecision(null);
    onClose();
  };

  if (!isOpen || !selectedItem) return null;

  return (
    <>
      {/* Main Loss Modal */}
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

          {/* Ingredient Loss Selection */}
          <div className="mb-6">
            <label className="label">
              <span className="label-text font-semibold">Select Ingredients That Were Lost</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Select which ingredients were lost and enter the lost quantities:
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedItem.ingredients?.map((ing, idx) => {
                const ingId = typeof ing.inventoryId === 'string' ? ing.inventoryId : (ing.inventoryId._id || ing.inventoryId.toString());
                const isSelected = selectedIngredients.includes(ingId);
                return (
                  <div key={idx} className="card bg-base-200 p-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIngredients([...selectedIngredients, ingId]);
                            // Set default lost quantity to full quantity when selected
                            setIngredientQuantities({
                              ...ingredientQuantities,
                              [ingId]: ing.quantity
                            });
                          } else {
                            setSelectedIngredients(selectedIngredients.filter(id => id !== ingId));
                            // Set lost quantity to 0 when deselected
                            setIngredientQuantities({
                              ...ingredientQuantities,
                              [ingId]: 0
                            });
                          }
                        }}
                      />
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
                          className={`input input-bordered input-sm w-24 ${!isSelected ? 'input-disabled' : ''}`}
                          value={ingredientQuantities[ingId] || 0}
                          onChange={(e) => {
                            setIngredientQuantities({
                              ...ingredientQuantities,
                              [ingId]: parseFloat(e.target.value) || 0
                            });
                          }}
                          min="0"
                          max={ing.quantity}
                          step="0.1"
                          disabled={!isSelected}
                          placeholder="0"
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
              onClick={handleClose}
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

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4 text-warning">
              ⚠️ Confirm Loss
            </h3>
            
            <div className="space-y-4">
              {(() => {
                const totalIngredients = selectedItem.ingredients.length;
                const lostIngredients = selectedIngredients.length;
                const isCompleteLoss = lostIngredients === totalIngredients || selectedItem.quantity === 1;
                
                return (
                  <div className={`alert ${isCompleteLoss ? 'alert-error' : 'alert-info'}`}>
                    <div>
                      <h4 className="font-semibold">What will happen:</h4>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Record loss: "{lossType}"</li>
                        {isCompleteLoss ? (
                          <>
                            <li>• <strong>Complete recipe loss</strong> - entire recipe will be removed from cooking</li>
                            <li>• All ingredients remain consumed (wasted/lost)</li>
                            <li>• Recipe will be moved to loss records</li>
                          </>
                        ) : (
                          <>
                            <li>• Partial loss - only selected ingredients are lost</li>
                            <li>• Lost ingredients remain consumed (wasted/lost)</li>
                            <li>• Recipe continues cooking with remaining ingredients</li>
                          </>
                        )}
                        <li>• You can cook replacement ingredients from Recipes page if needed</li>
                      </ul>
                    </div>
                  </div>
                );
              })()}

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
      {showRemakeModal && (
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

export default LossModal;