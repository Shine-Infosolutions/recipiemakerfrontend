import React, { useState } from 'react';
import { MdSave, MdCancel, MdEdit } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const EditUserForm = ({ user, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'User'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: window.innerWidth < 768 ? '20px' : '32px', 
      borderRadius: '16px', 
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      border: '1px solid #e9ecef',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f1f3f5'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <MdEdit size={24} />
        </div>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: window.innerWidth < 768 ? '20px' : '24px', 
            fontWeight: '700', 
            color: '#2d3436' 
          }}>
            Edit User
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: '#636e72',
            display: window.innerWidth < 768 ? 'none' : 'block'
          }}>
            Update user information and role permissions
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#2d3436' 
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter full name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'black',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00b894'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#2d3436' 
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'black',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00b894'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#2d3436' 
          }}>
            User Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{
              width: window.innerWidth < 768 ? '100%' : '50%',
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'black',
              background: 'white',
              transition: 'border-color 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00b894'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#f8f9fa',
              color: '#636e72',
              border: '2px solid #e9ecef',
              padding: window.innerWidth < 768 ? '12px 24px' : '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s',
              order: window.innerWidth < 768 ? 2 : 1
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e9ecef';
              e.target.style.color = '#2d3436';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.color = '#636e72';
            }}
          >
            <MdCancel /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              color: 'white',
              border: 'none',
              padding: window.innerWidth < 768 ? '12px 24px' : '12px 32px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(0, 184, 148, 0.3)',
              transition: 'all 0.3s',
              order: window.innerWidth < 768 ? 1 : 2
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.transform = 'translateY(0)';
            }}
          >
            <MdSave /> {loading ? 'Updating User...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;