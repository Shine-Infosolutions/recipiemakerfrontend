import React, { useState, useEffect } from 'react';
import { MdRestaurantMenu, MdInventory, MdSettings, MdDashboard, MdPeople } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import { BiError, BiLogOut } from 'react-icons/bi';
import { FaFire } from 'react-icons/fa';
import Register from './components/Register';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Inventory from './components/inventory/Inventory';
import Recipes from './components/recipes/Recipes';
import InProgress from './components/cooking/InProgress';
import Cooking from './components/cooking/Cooking';
import SemiFinished from './components/semifinished/SemiFinished';
import Users from './components/users/Users';
import ChangePassword from './components/ChangePassword';
import { apiRequest, API_URL } from './utils/api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'User');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await apiRequest(`${API_URL}/auth/verify`);
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };
    
    if (isLoggedIn) {
      checkAuthStatus();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole('User');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserRole(localStorage.getItem('userRole') || 'User');
  };

  if (!isLoggedIn) {
    return (
      <div>
        {showRegister ? (
          <>
            <Register onSuccess={handleLoginSuccess} />
            <p style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', color: 'white', zIndex: 10, textAlign: 'center', whiteSpace: 'nowrap' }}>
              Already have an account? <button onClick={() => setShowRegister(false)} style={{ background: 'white', border: 'none', color: '#667eea', cursor: 'pointer', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', marginLeft: '10px' }}>Login</button>
            </p>
          </>
        ) : (
          <>
            <Login onSuccess={handleLoginSuccess} />
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
    { id: 'inprogress', label: 'Cooking', Icon: FaFire, color: '#667eea' },
    { id: 'cooking', label: 'Finished Goods', Icon: GiCookingPot, color: '#667eea' },
    { id: 'semifinished', label: 'Semi-Finished', Icon: BiError, color: '#667eea' },
    { id: 'inventory', label: 'Raw Materials', Icon: MdInventory, color: '#667eea' },
    ...(userRole === 'Admin' ? [{ id: 'users', label: 'Users', Icon: MdPeople, color: '#667eea' }] : []),
    { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar for mobile and tablet */}
        <div className="navbar shadow-lg lg:hidden sticky top-0 z-40" style={{ backgroundColor: '#1f2937', color: 'white' }}>
          <div className="flex-none">
            <label htmlFor="my-drawer" className="btn btn-square btn-ghost" style={{ color: 'white' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current" style={{ stroke: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold" style={{ color: 'white' }}>🍳 Recipe Maker</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: 'white' }}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'recipes' && <Recipes />}
          {activeTab === 'inprogress' && <InProgress />}
          {activeTab === 'cooking' && <Cooking />}
          {activeTab === 'semifinished' && <SemiFinished />}
          {activeTab === 'users' && userRole === 'Admin' && <Users />}
          {activeTab === 'settings' && <ChangePassword />}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="min-h-full w-64 text-white flex flex-col shadow-2xl relative overflow-hidden sidebar-animated" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          backgroundSize: '400% 400%'
        }}>
          {/* Animated background overlay */}
          <div className="absolute inset-0 opacity-20 float-animated" style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
          
          {/* Sidebar header */}
          <div className="p-6 border-b border-white/20 relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <span className="text-3xl animate-bounce">🍳</span>
              <span>Recipe Maker</span>
            </h2>
            <p className="text-xs text-white/80 mt-2">Manage your kitchen</p>
          </div>

          {/* Menu items */}
          <ul className="menu p-4 flex-1 gap-2 relative z-10">
            {navItems.map((item, index) => (
              <li key={item.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fadeInUp">
                <a
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      document.getElementById('my-drawer').checked = false;
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                      : 'text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                  }`}
                  style={{
                    backdropFilter: 'blur(10px)',
                    boxShadow: activeTab === item.id ? '0 8px 32px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <item.Icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Logout button */}
          <div className="p-4 border-t border-white/20 relative z-10">
            <button
              onClick={handleLogout}
              className="w-full gap-2 px-4 py-3 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20 font-medium flex items-center justify-center"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <BiLogOut className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
