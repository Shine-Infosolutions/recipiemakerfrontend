import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Loading from '../common/Loading';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch departments');
      setDepartments([]);
    }
    setLoading(false);
  };

  const openModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || '',
        isActive: department.isActive
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Name and Code are required');
      return;
    }

    try {
      const url = editingDepartment 
        ? `${API_URL}/departments/${editingDepartment._id}`
        : `${API_URL}/departments`;
      
      const method = editingDepartment ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save department');
      }
      
      closeModal();
      fetchDepartments();
      toast.success(`Department ${editingDepartment ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteDepartment = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      const res = await fetch(`${API_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete department');
      }
      
      fetchDepartments();
      toast.success('Department deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/departments/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to toggle status');
      }
      
      fetchDepartments();
      toast.success('Department status updated!');
    } catch (error) {
      toast.error(error.message);
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
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: '700', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaBuilding style={{ fontSize: window.innerWidth < 768 ? '20px' : '28px', color: '#667eea', flexShrink: 0 }} /> Departments
            </h1>
            {window.innerWidth >= 768 && <p style={{ color: '#636e72', marginTop: '4px', fontSize: '13px', fontWeight: '500', margin: '4px 0 0 0' }}>Manage your departments</p>}
          </div>
          <button 
            onClick={() => openModal()}
            style={{ 
              padding: '10px 16px', 
              background: '#667eea', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaPlus /> Add Department
          </button>
        </div>

        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="table">
                <thead style={{ backgroundColor: '#f1f3f5' }}>
                  <tr>
                    <th style={{ color: '#2d3436', padding: '16px' }}>Name</th>
                    <th style={{ color: '#2d3436', padding: '16px' }}>Code</th>
                    <th style={{ color: '#2d3436', padding: '16px' }}>Description</th>
                    <th style={{ color: '#2d3436', padding: '16px' }}>Status</th>
                    <th style={{ color: '#2d3436', padding: '16px' }}>Created</th>
                    <th style={{ color: '#2d3436', padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department) => (
                    <tr key={department._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ color: '#2d3436', fontWeight: '600', padding: '16px' }}>
                        {department.name}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#667eea', 
                          background: '#e8ecff', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontWeight: '600' 
                        }}>
                          {department.code}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#636e72', fontSize: '14px' }}>
                        {department.description || '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          color: department.isActive ? '#00b894' : '#ff4757', 
                          background: department.isActive ? '#e8f5f0' : '#ffe8e8', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontWeight: '600' 
                        }}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '12px', color: '#636e72' }}>
                        {new Date(department.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => openModal(department)}
                            style={{ 
                              padding: '6px 10px', 
                              background: '#ffa502', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px' 
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => toggleStatus(department._id)}
                            style={{ 
                              padding: '6px 10px', 
                              background: department.isActive ? '#ff4757' : '#00b894', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px' 
                            }}
                          >
                            {department.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button 
                            onClick={() => deleteDepartment(department._id)}
                            style={{ 
                              padding: '6px 10px', 
                              background: '#ff4757', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px' 
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {departments.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  background: 'white', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                  border: '1px solid #e9ecef', 
                  maxWidth: '500px', 
                  margin: '60px auto' 
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px', color: '#667eea', display: 'flex', justifyContent: 'center' }}>
                  <FaBuilding />
                </div>
                <p style={{ fontSize: '18px', color: '#2d3436', fontWeight: '600', margin: '0 0 8px 0' }}>
                  No departments found
                </p>
                <p style={{ fontSize: '14px', color: '#636e72', margin: 0 }}>
                  Create your first department to get started!
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Department Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Department Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Kitchen, Bakery, Beverages"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Department Code *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., KIT, BAK, BEV"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the department"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">Active Status</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingDepartment ? 'Update' : 'Create'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Departments;