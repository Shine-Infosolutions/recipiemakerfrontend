import React, { useState } from 'react';
import { MdPeople } from 'react-icons/md';
import UserList from './UserList';
import UserForm from './UserForm';
import EditUserForm from './EditUserForm';

const Users = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSave = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  return (
    <div style={{ 
      marginTop: window.innerWidth < 768 ? '0px' : '0px',
      padding: window.innerWidth < 768 ? '15px' : '30px',
      background: '#f8f9fa',
      minHeight: window.innerWidth < 768 ? 'calc(100vh - 64px)' : '100vh'
    }}>
      <div style={{ marginBottom: '20px' }}>
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

      <UserList onEdit={handleEdit} onAdd={handleAdd} key={refreshTrigger} />
      
      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <UserForm onCancel={handleCancel} onSave={handleSave} />
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <EditUserForm 
              user={selectedUser} 
              onCancel={handleCancel} 
              onSave={handleSave} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;