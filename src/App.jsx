import React, { useState, useEffect } from 'react';
import { MdRestaurantMenu, MdInventory, MdSettings, MdDashboard, MdPeople, MdAssessment, MdAttachMoney } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import { BiError, BiLogOut } from 'react-icons/bi';
import { FaFire, FaChevronDown, FaChevronRight } from 'react-icons/fa';
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
import InventoryReport from './components/reports/InventoryReport';
import RecipeReport from './components/reports/RecipeReport';
import ProductionReport from './components/reports/ProductionReport';
import RevenueReport from './components/reports/RevenueReport';
import { apiRequest, API_URL } from './utils/api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'User');
  const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);

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
          <Login onSuccess={handleLoginSuccess} />
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
    { id: 'reports', label: 'Reports', Icon: MdAssessment, color: '#667eea' },
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
          {activeTab === 'inventory-report' && userRole === 'Admin' && <InventoryReport />}
          {activeTab === 'recipe-report' && userRole === 'Admin' && <RecipeReport />}
          {activeTab === 'production-report' && userRole === 'Admin' && <ProductionReport />}
          {activeTab === 'revenue-report' && userRole === 'Admin' && <RevenueReport />}
          {activeTab === 'settings' && <ChangePassword />}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-50 scrollbar-hide" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="min-h-full w-64 text-white flex flex-col shadow-2xl relative overflow-hidden sidebar-animated scrollbar-hide" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          backgroundSize: '400% 400%',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
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
          <ul className="menu p-4 flex-1 gap-2 relative z-10 overflow-y-auto scrollbar-hide">
            {navItems.map((item, index) => (
              <li key={item.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fadeInUp">
                {item.id === 'reports' && userRole === 'Admin' ? (
                  <>
                    <a
                      onClick={() => setShowReportsSubmenu(!showReportsSubmenu)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm cursor-pointer"
                      style={{ backdropFilter: 'blur(10px)' }}
                    >
                      <item.Icon className="text-xl" />
                      <span className="font-medium flex-1">{item.label}</span>
                      {showReportsSubmenu ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
                    </a>
                    {showReportsSubmenu && (
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>
                          <a
                            onClick={() => {
                              setActiveTab('inventory-report');
                              if (window.innerWidth < 1024) {
                                document.getElementById('my-drawer').checked = false;
                              }
                            }}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                              activeTab === 'inventory-report'
                                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                                : 'text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                            }`}
                            style={{ backdropFilter: 'blur(10px)' }}
                          >
                            <MdInventory className="text-lg" />
                            <span className="font-medium">Inventory Report</span>
                          </a>
                        </li>
                        <li>
                          <a
                            onClick={() => {
                              setActiveTab('recipe-report');
                              if (window.innerWidth < 1024) {
                                document.getElementById('my-drawer').checked = false;
                              }
                            }}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                              activeTab === 'recipe-report'
                                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                                : 'text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                            }`}
                            style={{ backdropFilter: 'blur(10px)' }}
                          >
                            <MdRestaurantMenu className="text-lg" />
                            <span className="font-medium">Recipe Report</span>
                          </a>
                        </li>
                        <li>
                          <a
                            onClick={() => {
                              setActiveTab('production-report');
                              if (window.innerWidth < 1024) {
                                document.getElementById('my-drawer').checked = false;
                              }
                            }}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                              activeTab === 'production-report'
                                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                                : 'text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                            }`}
                            style={{ backdropFilter: 'blur(10px)' }}
                          >
                            <GiCookingPot className="text-lg" />
                            <span className="font-medium">Production Report</span>
                          </a>
                        </li>
                        <li>
                          <a
                            onClick={() => {
                              setActiveTab('revenue-report');
                              if (window.innerWidth < 1024) {
                                document.getElementById('my-drawer').checked = false;
                              }
                            }}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                              activeTab === 'revenue-report'
                                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                                : 'text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                            }`}
                            style={{ backdropFilter: 'blur(10px)' }}
                          >
                            <MdAttachMoney className="text-lg" />
                            <span className="font-medium">Revenue Report</span>
                          </a>
                        </li>
                      </ul>
                    )}
                  </>
                ) : (
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
                )}
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
