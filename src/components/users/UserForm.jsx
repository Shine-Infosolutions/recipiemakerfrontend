import React, { useState, useEffect } from 'react';
import { MdPersonAdd } from 'react-icons/md';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const UserForm = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    departmentId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/departments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.filter(dept => dept.isActive));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate department selection for non-admin users (Staff, Chef, and Waiter)
    if (formData.role !== 'Admin' && !formData.departmentId) {
      toast.error('Please select a department for Staff, Chef, and Waiter roles');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('User created successfully!');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
    setLoading(false);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          <MdPersonAdd className="inline mr-2" /> Add New User
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="input input-bordered"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">User Role</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    role: e.target.value,
                    departmentId: e.target.value === 'Admin' ? '' : formData.departmentId
                  });
                }}
              >
                <option value="Staff">Staff</option>
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {formData.role !== 'Admin' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Department *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  required={formData.role !== 'Admin'}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt text-info">
                    {formData.role === 'Staff' && 'Staff work in various departments for general tasks'}
                    {formData.role === 'Chef' && 'Chefs work in kitchen/cooking departments'}
                    {formData.role === 'Waiter' && 'Waiters work in service departments'}
                  </span>
                </label>
              </div>
            )}
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;