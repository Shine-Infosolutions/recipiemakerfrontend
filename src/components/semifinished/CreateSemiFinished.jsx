import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdAdd, MdClose, MdKitchen } from 'react-icons/md';
import { useDepartments } from '../../contexts/DepartmentContext';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const CreateSemiFinished = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    rawMaterials: [{ inventoryId: '', quantity: '', unit: '' }]
  });
  const [inventory, setInventory] = useState([]);
  const { departments } = useDepartments();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

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

  const addRawMaterial = () => {
    setFormData({
      ...formData,
      rawMaterials: [...formData.rawMaterials, { inventoryId: '', quantity: '', unit: '' }]
    });
  };

  const updateRawMaterial = (index, field, value) => {
    const updated = [...formData.rawMaterials];
    updated[index][field] = value;
    if (field === 'inventoryId') {
      const item = inventory.find(i => i._id === value);
      if (item) updated[index].unit = item.unit;
    }
    setFormData({ ...formData, rawMaterials: updated });
  };

  const removeRawMaterial = (index) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.departmentId || formData.rawMaterials.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.rawMaterials.every(rm => rm.inventoryId && rm.quantity)) {
      toast.error('Please complete all raw material entries');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/semi-finished`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          departmentId: formData.departmentId,
          rawMaterials: formData.rawMaterials.map(rm => ({
            inventoryId: rm.inventoryId,
            quantity: parseFloat(rm.quantity),
            unit: rm.unit
          }))
        })
      });

      if (res.ok) {
        toast.success('Semi-finished item created successfully!');
        setFormData({
          name: '',
          departmentId: '',
          rawMaterials: [{ inventoryId: '', quantity: '', unit: '' }]
        });
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to create semi-finished item');
      }
    } catch (error) {
      toast.error('Error creating semi-finished item');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">
          <MdKitchen className="inline mr-2" /> Create Semi-Finished Item
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Semi-Finished Name <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              placeholder="e.g., Chopped Onions, Marinated Chicken"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Department <span className="text-red-500">*</span></span>
            </label>
            <select
              className="select select-bordered"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="label">
              <span className="label-text font-semibold">Raw Materials Required</span>
            </label>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addRawMaterial}
            >
              <MdAdd className="text-base" /> Add Raw Material
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-4">
            {formData.rawMaterials.map((material, index) => (
              <div key={index} className="card bg-base-200 p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="badge badge-primary">Raw Material {index + 1}</span>
                  {formData.rawMaterials.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={() => removeRawMaterial(index)}
                    >
                      <MdClose className="text-base" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Select Raw Material</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={material.inventoryId}
                      onChange={(e) => updateRawMaterial(index, 'inventoryId', e.target.value)}
                    >
                      <option value="">Choose raw material...</option>
                      {inventory.map(inv => (
                        <option key={inv._id} value={inv._id}>
                          {inv.name} (Available: {inv.quantity} {inv.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity Required</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Enter quantity"
                        className="input input-bordered flex-1"
                        value={material.quantity}
                        onChange={(e) => updateRawMaterial(index, 'quantity', e.target.value)}
                      />
                      <span className="bg-base-300 px-3 py-2 text-sm font-medium">
                        {material.unit || 'unit'}
                      </span>
                    </div>
                    <div className="label">
                      <span className="label-text-alt">Amount needed per unit of semi-finished item</span>
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
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Semi-Finished Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSemiFinished;