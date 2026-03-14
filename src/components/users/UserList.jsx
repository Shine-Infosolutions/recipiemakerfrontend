import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdDelete, MdAdd, MdPeople } from 'react-icons/md';
import Loading from '../common/Loading';
import { apiRequest, API_URL } from '../../utils/api';

const UserList = ({ onEdit, onAdd }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${API_URL}/auth/users`);
      if (response && response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const toggleUserStatus = async (id) => {
    try {
      await apiRequest(`${API_URL}/auth/users/${id}/toggle-status`, {
        method: 'PATCH'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiRequest(`${API_URL}/auth/users/${id}`, {
          method: 'DELETE'
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ 
            fontSize: window.innerWidth < 768 ? '18px' : '24px', 
            fontWeight: '700', 
            color: '#2d3436', 
            margin: 0, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}>
            <MdPeople style={{ 
              fontSize: window.innerWidth < 768 ? '20px' : '28px', 
              color: '#667eea', 
              flexShrink: 0 
            }} /> 
            User Management
          </h1>
          {window.innerWidth >= 768 && (
            <p style={{ 
              color: '#636e72', 
              marginTop: '4px', 
              fontSize: '13px', 
              fontWeight: '500', 
              margin: '4px 0 0 0' 
            }}>
              Manage system users and their roles
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
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
            whiteSpace: 'nowrap'
          }}
        >
          + Add User
        </motion.button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table w-full">
          <thead style={{ backgroundColor: '#f1f3f5' }}>
            <tr>
              <th style={{ color: '#2d3436' }}>User</th>
              <th style={{ color: '#2d3436' }}>Email</th>
              <th style={{ color: '#2d3436' }}>Role</th>
              <th style={{ color: '#2d3436' }}>Department</th>
              <th style={{ color: '#2d3436' }}>Status</th>
              <th style={{ color: '#2d3436', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr 
                key={user._id} 
                style={{ borderBottom: '1px solid #e9ecef' }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ margin: 0, fontSize: '14px', color: '#2d3436' }}>{user.name}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#636e72' }}>Member</p>
                    </div>
                  </div>
                </td>
                <td style={{ color: '#2d3436' }}>{user.email}</td>
                <td>
                  <span className={`badge badge-sm ${
                    user.role === 'Admin' ? 'badge-primary' : 
                    user.role === 'Chef' ? 'badge-accent' :
                    user.role === 'Staff' ? 'badge-success' : 
                    user.role === 'Waiter' ? 'badge-warning' : 'badge-ghost'
                  }`}>
                    {user.role || 'Staff'}
                  </span>
                </td>
                <td>
                  {user.role === 'Admin' ? (
                    <span style={{ color: '#636e72', fontSize: '12px', fontStyle: 'italic' }}>N/A</span>
                  ) : user.departmentId ? (
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#667eea', 
                      background: '#e8ecff', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontWeight: '600' 
                    }}>
                      {user.departmentId.name} ({user.departmentId.code})
                    </span>
                  ) : (
                    <span style={{ color: '#ff4757', fontSize: '12px' }}>No Department</span>
                  )}
                </td>
                <td>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input 
                        type="checkbox" 
                        className="toggle toggle-sm" 
                        style={{
                          backgroundColor: user.isActive !== false ? '#10b981' : '#ef4444',
                          borderColor: user.isActive !== false ? '#10b981' : '#ef4444'
                        }}
                        checked={user.isActive !== false}
                        onChange={() => toggleUserStatus(user._id)}
                      />
                      <span className={`label-text text-sm font-medium ${user.isActive !== false ? 'text-success' : 'text-error'}`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </td>
                <td>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="btn btn-sm btn-primary"
                    >
                      <MdEdit className="text-base" /> Edit
                    </button>
                    <button 
                      onClick={() => deleteUser(user._id)} 
                      className="btn btn-sm btn-error"
                    >
                      <MdDelete className="text-base" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
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
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '12px', 
            color: '#667eea', 
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <MdPeople />
          </div>
          <p style={{ 
            fontSize: '18px', 
            color: '#2d3436', 
            fontWeight: '600', 
            margin: '0 0 8px 0' 
          }}>
            Your user list is empty
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#636e72', 
            margin: 0 
          }}>
            Click "Add User" to start managing users!
          </p>
        </motion.div>
      )}
    </>
  );
};

export default UserList;