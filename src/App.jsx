import React, { useState, useEffect, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Register from './components/Register';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Loading from './components/common/Loading';
import { DepartmentProvider } from './contexts/DepartmentContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { apiRequest, API_URL } from './utils/api';
import { canAccessPage } from './utils/permissions';
import { hasValidToken, clearAuthData } from './utils/authUtils';

// Lazy load components for code splitting
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const Inventory = React.lazy(() => import('./components/inventory/Inventory'));
const Recipes = React.lazy(() => import('./components/recipes/Recipes'));
const InProgress = React.lazy(() => import('./components/cooking/InProgress'));
const Cooking = React.lazy(() => import('./components/cooking/Cooking'));
const SemiFinished = React.lazy(() => import('./components/semifinished/SemiFinished'));
const LossGoods = React.lazy(() => import('./components/loss/LossGoods'));
const AdjustedRecipes = React.lazy(() => import('./components/adjustedrecipes/AdjustedRecipes'));
const Departments = React.lazy(() => import('./components/departments/Departments'));
const Users = React.lazy(() => import('./components/users/Users'));
const ChangePassword = React.lazy(() => import('./components/ChangePassword'));
const InventoryReport = React.lazy(() => import('./components/reports/InventoryReport'));
const RecipeReport = React.lazy(() => import('./components/reports/RecipeReport'));
const ProductionReport = React.lazy(() => import('./components/reports/ProductionReport'));
const RevenueReport = React.lazy(() => import('./components/reports/RevenueReport'));
const StockLogsReport = React.lazy(() => import('./components/reports/StockLogsReport'));
const TransferReport = React.lazy(() => import('./components/reports/TransferReport'));
const BulkDataManager = React.lazy(() => import('./components/BulkDataManager'));
const Analytics = React.lazy(() => import('./components/analytics/Analytics'));

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = checking, false = not logged in, true = logged in
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, logout: userLogout, loading: userLoading } = useUser();
  const userRole = user?.role;

  // Set default page based on user role
  useEffect(() => {
    if (userRole) {
      let defaultTab = 'dashboard'; // Default for admin and manager
      
      if (userRole === 'kitchen') {
        defaultTab = 'recipes';
      } else if (userRole === 'store') {
        defaultTab = 'inventory';
      }
      
      setActiveTab(defaultTab);
    }
  }, [userRole]);

  // Check for valid token on app start
  useEffect(() => {
    const checkAuth = () => {
      if (hasValidToken()) {
        setIsLoggedIn(true);
      } else {
        clearAuthData();
        setIsLoggedIn(false);
      }
    };
    
    // Add a small delay to prevent flash
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

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
    userLogout();
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Show loading screen while checking authentication or user is loading
  if (isLoggedIn === null || userLoading) {
    return <Loading />;
  }

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

  // Don't render pages until user is loaded to avoid permission issues
  if (!user || !userRole) {
    return <Loading />;
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
            {user?.departmentId && (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                {user.departmentId.name} ({user.departmentId.code})
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: 'white' }}>
          <Suspense fallback={<Loading />}>
            {activeTab === 'dashboard' && canAccessPage(userRole, 'dashboard') && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'inventory' && canAccessPage(userRole, 'inventory') && <Inventory />}
            {activeTab === 'recipes' && canAccessPage(userRole, 'recipes') && <Recipes />}
            {activeTab === 'inprogress' && canAccessPage(userRole, 'inprogress') && <InProgress />}
            {activeTab === 'cooking' && canAccessPage(userRole, 'cooking') && <Cooking />}
            {activeTab === 'semifinished' && canAccessPage(userRole, 'semifinished') && <SemiFinished />}
            {activeTab === 'lossgoods' && canAccessPage(userRole, 'lossgoods') && <LossGoods />}
            {activeTab === 'adjustedrecipes' && canAccessPage(userRole, 'adjustedrecipes') && <AdjustedRecipes />}
            {activeTab === 'departments' && canAccessPage(userRole, 'departments') && <Departments />}
            {activeTab === 'users' && canAccessPage(userRole, 'users') && <Users />}
            {activeTab === 'inventory-report' && canAccessPage(userRole, 'inventory-report') && <InventoryReport />}
            {activeTab === 'recipe-report' && canAccessPage(userRole, 'recipe-report') && <RecipeReport />}
            {activeTab === 'production-report' && canAccessPage(userRole, 'production-report') && <ProductionReport />}
            {activeTab === 'revenue-report' && canAccessPage(userRole, 'revenue-report') && <RevenueReport />}
            {activeTab === 'stock-logs-report' && canAccessPage(userRole, 'stock-logs-report') && <StockLogsReport />}
            {activeTab === 'transfer-report' && canAccessPage(userRole, 'transfer-report') && <TransferReport />}
            {activeTab === 'bulk-data' && canAccessPage(userRole, 'bulk-data') && <BulkDataManager />}
            {activeTab === 'analytics' && canAccessPage(userRole, 'analytics') && <Analytics />}
            {activeTab === 'settings' && <ChangePassword />}
          </Suspense>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userRole={userRole}
        user={user}
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

const App = () => {
  return (
    <UserProvider>
      <DepartmentProvider>
        <AppContent />
      </DepartmentProvider>
    </UserProvider>
  );
};

export default App;
