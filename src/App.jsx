import React, { useState, useEffect } from 'react';
import { MdRestaurantMenu, MdInventory, MdSettings, MdDashboard } from 'react-icons/md';
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
    { id: 'inprogress', label: 'Cooking', Icon: FaFire, color: '#667eea' },
    { id: 'cooking', label: 'Finished Goods', Icon: GiCookingPot, color: '#667eea' },
    { id: 'semifinished', label: 'Semi-Finished', Icon: BiError, color: '#667eea' },
    { id: 'inventory', label: 'Raw Materials', Icon: MdInventory, color: '#667eea' },
    { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar for mobile */}
        <div className="navbar bg-base-100 shadow-lg lg:hidden">
          <div className="flex-none">
            <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">🍳 Recipe Maker</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto bg-base-200">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'recipes' && <Recipes />}
          {activeTab === 'inprogress' && <InProgress />}
          {activeTab === 'cooking' && <Cooking />}
          {activeTab === 'semifinished' && <SemiFinished />}
          {activeTab === 'settings' && <ChangePassword />}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="min-h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
          {/* Sidebar header */}
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🍳</span>
              <span>Recipe Maker</span>
            </h2>
            <p className="text-xs text-slate-400 mt-2">Manage your kitchen</p>
          </div>

          {/* Menu items */}
          <ul className="menu p-4 flex-1 gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
                  }`}
                >
                  <item.Icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Logout button */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="btn btn-error w-full gap-2 shadow-lg"
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
