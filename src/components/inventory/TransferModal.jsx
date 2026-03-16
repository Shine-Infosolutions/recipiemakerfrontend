import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdTransferWithinAStation } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const TransferModal = ({ 
  isOpen, 
  onClose, 
  item, 
  departments, 
  onTransferSuccess 
}) => {
  const [transferData, setTransferData] = useState({
    toDepartmentId: '',
    quantity: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      setTransferData({
        toDepartmentId: '',
        quantity: '',
        notes: ''
      });
    }
  }, [isOpen, item]);

  const handleTransfer = async () => {
    if (!item || !transferData.toDepartmentId || !transferData.quantity) {
      toast.error('Please fill in all required fields!');
      return;
    }

    const quantity = parseInt(transferData.quantity);
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > item.quantity) {
      toast.error(`Cannot transfer more than available quantity (${item.quantity})`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/inventory/${item._id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toDepartmentId: transferData.toDepartmentId,
          quantity: quantity,
          notes: transferData.notes
        })
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Item transferred successfully! Transfer ID: ${result.transfer._id.slice(-6)}`);
        onTransferSuccess && onTransferSuccess(result.transfer);
        handleClose();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to transfer item');
      }
    } catch (error) {
      console.error('Error transferring item:', error);
      toast.error('Error transferring item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTransferData({
      toDepartmentId: '',
      quantity: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  const availableDepartments = departments.filter(dept => 
    dept._id !== item.departmentId?._id
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">
          <MdTransferWithinAStation className="inline mr-2" /> Transfer Item
        </h3>
        
        {/* Item Details */}
        <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
          <h4 className="font-semibold text-gray-200 mb-2">Item Details</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-gray-200">Name:</span> {item.name}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-gray-200">From:</span> {item.departmentId?.name || 'No Department'}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-gray-200">Available:</span> {item.quantity} {item.unit}
            </p>
            {item.productCode && (
              <p className="text-sm text-gray-300">
                <span className="font-medium text-gray-200">Code:</span> {item.productCode}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Department Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Transfer to Department <span className="text-red-500">*</span></span>
            </label>
            <select
              className="select select-bordered"
              value={transferData.toDepartmentId}
              onChange={(e) => setTransferData({ ...transferData, toDepartmentId: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Select Department</option>
              {availableDepartments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
          
          {/* Quantity Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Quantity to Transfer <span className="text-red-500">*</span></span>
            </label>
            <input
              type="number"
              placeholder="Enter quantity"
              className="input input-bordered"
              value={transferData.quantity}
              onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
              min="1"
              max={item.quantity}
              disabled={isLoading}
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Max: {item.quantity} {item.unit}
              </span>
            </label>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Notes (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              placeholder="Add any notes about this transfer..."
              value={transferData.notes}
              onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
              disabled={isLoading}
            ></textarea>
          </div>
        </div>
        
        {/* Modal Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleTransfer}
            disabled={
              isLoading || 
              !transferData.toDepartmentId || 
              !transferData.quantity || 
              parseInt(transferData.quantity) > item.quantity ||
              parseInt(transferData.quantity) <= 0
            }
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Transferring...
              </>
            ) : (
              'Transfer Item'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;