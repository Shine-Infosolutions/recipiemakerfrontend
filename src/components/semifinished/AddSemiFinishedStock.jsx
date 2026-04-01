import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdAdd, MdClose } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const AddSemiFinishedStock = ({ isOpen, onClose, onSuccess, semiFinishedItem }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    rawMaterials: []
  });
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && semiFinishedItem) {
      // Initialize form with the semi-finished item's raw materials
      setFormData({
        quantity: '',
        rawMaterials: semiFinishedItem.rawMaterials.map(rm => ({
          inventoryId: rm.inventoryId._id,
          name: rm.inventoryId.name,
          requiredQuantity: rm.quantity,
          unit: rm.unit,
          quantityToUse: rm.quantity // Start with the base quantity per unit
        }))
      });
      fetchInventory();
    }
  }, [isOpen, semiFinishedItem]);

  // Update raw material quantities when production quantity changes
  useEffect(() => {
    if (formData.quantity && formData.rawMaterials.length > 0) {
      const updatedRawMaterials = formData.rawMaterials.map(rm => ({
        ...rm,
        quantityToUse: rm.requiredQuantity * parseFloat(formData.quantity || 1)
      }));
      setFormData(prev => ({ ...prev, rawMaterials: updatedRawMaterials }));
    }
  }, [formData.quantity]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.quantity) {
      toast.error('Please enter the quantity to produce');
      return;
    }

    // Check if we have enough raw materials
    const insufficientMaterials = formData.rawMaterials.filter(rm => {
      const invItem = inventory.find(i => i._id === rm.inventoryId);
      return !invItem || invItem.quantity < rm.quantityToUse;
    });

    if (insufficientMaterials.length > 0) {
      toast.error('Insufficient raw materials for production');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/semi-finished/${semiFinishedItem._id}/add-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quantityToAdd: parseFloat(formData.quantity),
          rawMaterialsUsed: formData.rawMaterials.map(rm => ({
            inventoryId: rm.inventoryId,
            quantity: rm.quantityToUse,
            unit: rm.unit
          }))
        })
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(result.message || 'Stock added successfully!');
        setFormData({ quantity: '', rawMaterials: [] });
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add stock');
      }
    } catch (error) {
      toast.error('Error adding stock');
    }
    setLoading(false);
  };

  if (!isOpen || !semiFinishedItem) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg mb-4">
          <MdAdd className="inline mr-2" /> Add Stock: {semiFinishedItem.name}
        </h3>
        
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Quantity to Produce <span className="text-red-500">*</span></span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Enter quantity to produce"
            className="input input-bordered"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="label">
            <span className="label-text font-semibold">Raw Materials Required</span>
          </label>
          
          <div className="space-y-4">
            {formData.rawMaterials.map((material, index) => {
              const invItem = inventory.find(i => i._id === material.inventoryId);
              const hasEnough = invItem && invItem.quantity >= material.quantityToUse;
              
              return (
                <div key={index} className="card bg-base-200 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-semibold text-base">{material.name}</span>
                      <div className="text-sm text-gray-600">
                        Available: {invItem?.quantity || 0} {material.unit}
                      </div>
                    </div>
                    <div className={`badge ${hasEnough ? 'badge-success' : 'badge-error'}`}>
                      {hasEnough ? 'Available' : 'Insufficient'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Required per Unit</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={`${material.requiredQuantity} ${material.unit}`}
                        disabled
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Total to Use (Auto-calculated)</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          className={`input input-bordered flex-1 ${!hasEnough ? 'input-error' : ''}`}
                          value={material.quantityToUse}
                          readOnly // Make it read-only since it's auto-calculated
                        />
                        <span className="bg-base-300 px-3 py-2 text-sm font-medium">{material.unit}</span>
                      </div>
                      <div className="label">
                        <span className="label-text-alt text-info">
                          {material.requiredQuantity} {material.unit} × {formData.quantity || 0} units = {material.quantityToUse} {material.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-base-200 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Production Status:</span>
            <div className={`badge ${formData.rawMaterials.every(rm => {
              const invItem = inventory.find(i => i._id === rm.inventoryId);
              return invItem && invItem.quantity >= rm.quantityToUse;
            }) ? 'badge-success' : 'badge-error'}`}>
              {formData.rawMaterials.every(rm => {
                const invItem = inventory.find(i => i._id === rm.inventoryId);
                return invItem && invItem.quantity >= rm.quantityToUse;
              }) ? 'Ready to Produce' : 'Insufficient Materials'}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !formData.quantity || !formData.rawMaterials.every(rm => {
              const invItem = inventory.find(i => i._id === rm.inventoryId);
              return invItem && invItem.quantity >= rm.quantityToUse;
            })}
          >
            {loading ? 'Adding Stock...' : 'Add Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSemiFinishedStock;