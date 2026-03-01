import React, { useState, useEffect } from 'react';
import { MdRestaurantMenu, MdInventory, MdFactory, MdSettings, MdDashboard } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import { BiError, BiLogOut } from 'react-icons/bi';
import Register from './components/Register';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/inventory/Inventory';
import Recipes from './components/Recipes';
import RawMaterials from './components/RawMaterials';
import Cooking from './components/Cooking';
import SemiFinished from './components/SemiFinished';
import ChangePassword from './components/ChangePassword';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div>
        {showRegister ? (
          <>
            <Register onSuccess={() => setIsLoggedIn(true)} />
            <p style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', color: 'white', zIndex: 10, textAlign: 'center', whiteSpace: 'nowrap' }}>
              Already have an account? <button onClick={() => setShowRegister(false)} style={{ background: 'white', border: 'none', color: '#667eea', cursor: 'pointer', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', marginLeft: '10px' }}>Login</button>
            </p>
          </>
        ) : (
          <>
            <Login onSuccess={() => setIsLoggedIn(true)} />
            <p style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', color: 'white', zIndex: 10, textAlign: 'center', whiteSpace: 'nowrap' }}>
              Don't have an account? <button onClick={() => setShowRegister(true)} style={{ background: 'white', border: 'none', color: '#667eea', cursor: 'pointer', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', marginLeft: '10px' }}>Register</button>
            </p>
          </>
        )}
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: MdDashboard, color: '#667eea' },
    { id: 'recipes', label: 'Recipes', Icon: MdRestaurantMenu, color: '#667eea' },
    { id: 'cooking', label: 'Cooking', Icon: GiCookingPot, color: '#667eea' },
    { id: 'semifinished', label: 'Semi-Finished', Icon: BiError, color: '#667eea' },
    { id: 'inventory', label: 'Inventory', Icon: MdInventory, color: '#667eea' },
    { id: 'rawmaterials', label: 'Materials', Icon: MdFactory, color: '#667eea' },
    { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isMobile && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: isMobile ? '80px' : '0' }}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'recipes' && <Recipes />}
          {activeTab === 'cooking' && <Cooking />}
          {activeTab === 'semifinished' && <SemiFinished />}
          {activeTab === 'rawmaterials' && <RawMaterials />}
          {activeTab === 'settings' && <ChangePassword />}
        </div>
      </div>
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0 14px 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          borderTop: '2px solid #e9ecef'
        }}>
          {navItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                cursor: 'pointer', 
                flex: 1, 
                padding: '6px',
                transition: 'all 0.3s ease',
                transform: activeTab === item.id ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <item.Icon style={{ 
                fontSize: '24px', 
                color: activeTab === item.id ? item.color : '#95a5a6',
                transition: 'all 0.3s ease'
              }} />
              <span style={{ 
                fontSize: '11px', 
                color: activeTab === item.id ? item.color : '#95a5a6', 
                fontWeight: activeTab === item.id ? '700' : '500', 
                marginTop: '4px',
                transition: 'all 0.3s ease'
              }}>{item.label}</span>
            </div>
          ))}
          <div onClick={handleLogout} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1, padding: '6px' }}>
            <BiLogOut style={{ fontSize: '24px', color: '#e74c3c' }} />
            <span style={{ fontSize: '11px', color: '#e74c3c', marginTop: '4px', fontWeight: '500' }}>Logout</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
