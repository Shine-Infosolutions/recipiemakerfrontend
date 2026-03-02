import React from 'react';
import { motion } from 'framer-motion';
import { MdRestaurantMenu, MdInventory, MdFactory, MdSettings, MdDashboard } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import { BiError, BiLogOut } from 'react-icons/bi';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: MdDashboard, color: '#667eea' },
    { id: 'recipes', label: 'Recipes', Icon: MdRestaurantMenu, color: '#667eea' },
    { id: 'cooking', label: 'Finished Goods', Icon: GiCookingPot, color: '#667eea' },
    { id: 'semifinished', label: 'Semi-Finished', Icon: BiError, color: '#667eea' },
    { id: 'inventory', label: 'Raw Materials', Icon: MdInventory, color: '#667eea' },
    { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
  ];

  return (
    <div style={{ 
      width: '250px', 
      background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
    }}>
      <div style={{ padding: '20px 15px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>🍳 Recipe Maker</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '4px 0 0 0', fontWeight: '500' }}>Manage your kitchen</p>
      </div>
      
      <div style={{ flex: 1, padding: '15px 0' }}>
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '12px 15px',
              margin: '4px 10px',
              borderRadius: '10px',
              cursor: 'pointer',
              background: activeTab === item.id ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)' : 'transparent',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: activeTab === item.id ? '600' : '500',
              transition: 'all 0.3s',
              borderLeft: activeTab === item.id ? `3px solid ${item.color}` : '3px solid transparent',
              boxShadow: activeTab === item.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            <span style={{ fontSize: '20px', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.7)', flexShrink: 0 }}><item.Icon /></span>
            <span style={{ color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
          </motion.div>
        ))}
      </div>
      
      <div style={{ padding: '15px' }}>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(231,76,60,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(231,76,60,0.3)'
          }}
        >
          <BiLogOut style={{ fontSize: '18px' }} />
          Logout
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
