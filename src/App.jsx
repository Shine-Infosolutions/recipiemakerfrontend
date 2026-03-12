import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Register from './components/Register';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Inventory from './components/inventory/Inventory';
import Recipes from './components/recipes/Recipes';
import InProgress from './components/cooking/InProgress';
import Cooking from './components/cooking/Cooking';
import SemiFinished from './components/semifinished/SemiFinished';
import LossGoods from './components/loss/LossGoods';
import Users from './components/users/Users';
import ChangePassword from './components/ChangePassword';
import InventoryReport from './components/reports/InventoryReport';
import RecipeReport from './components/reports/RecipeReport';
import ProductionReport from './components/reports/ProductionReport';
import RevenueReport from './components/reports/RevenueReport';
import StockLogsReport from './components/reports/StockLogsReport';
import BulkDataManager from './components/BulkDataManager';
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
          <Login onSuccess={handleLoginSuccess} />
        )}
      </div>
    );
  }

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
          {activeTab === 'lossgoods' && <LossGoods />}
          {activeTab === 'users' && userRole === 'Admin' && <Users />}
          {activeTab === 'inventory-report' && userRole === 'Admin' && <InventoryReport />}
          {activeTab === 'recipe-report' && userRole === 'Admin' && <RecipeReport />}
          {activeTab === 'production-report' && userRole === 'Admin' && <ProductionReport />}
          {activeTab === 'revenue-report' && userRole === 'Admin' && <RevenueReport />}
          {activeTab === 'stock-logs-report' && userRole === 'Admin' && <StockLogsReport />}
          {activeTab === 'bulk-data' && userRole === 'Admin' && <BulkDataManager />}
          {activeTab === 'settings' && <ChangePassword />}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userRole={userRole}
      />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#00b894',
            },
          },
          error: {
            style: {
              background: '#e74c3c',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
