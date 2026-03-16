import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurantMenu, MdInventory, MdSettings, MdDashboard, MdPeople, MdAssessment, MdAttachMoney, MdHistory, MdCloudUpload, MdError, MdBarChart, MdSwapHoriz } from 'react-icons/md';
import { GiCookingPot } from 'react-icons/gi';
import { BiError, BiLogOut } from 'react-icons/bi';
import { FaFire, FaChevronDown, FaChevronRight, FaBuilding } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userRole }) => {
  const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);

  const getNavItemsForRole = (role) => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', Icon: MdDashboard, color: '#667eea' },
      { id: 'analytics', label: 'Analytics', Icon: MdBarChart, color: '#667eea' },
    ];

    if (role === 'Admin') {
      return [
        ...baseItems,
        { id: 'departments', label: 'Departments', Icon: FaBuilding, color: '#667eea' },
        { id: 'recipes', label: 'Recipes', Icon: MdRestaurantMenu, color: '#667eea' },
        { id: 'inprogress', label: 'Cooking', Icon: FaFire, color: '#667eea' },
        { id: 'cooking', label: 'Finished Goods', Icon: GiCookingPot, color: '#667eea' },
        { id: 'semifinished', label: 'Semi-Finished', Icon: BiError, color: '#667eea' },
        { id: 'lossgoods', label: 'Loss Goods', Icon: MdError, color: '#ff4757' },
        { id: 'inventory', label: 'Raw Materials', Icon: MdInventory, color: '#667eea' },
        { id: 'bulk-data', label: 'Bulk Data', Icon: MdCloudUpload, color: '#667eea' },
        { id: 'reports', label: 'Reports', Icon: MdAssessment, color: '#667eea' },
        { id: 'users', label: 'Users', Icon: MdPeople, color: '#667eea' },
        { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
      ];
    } else if (role === 'Chef') {
      return [
        ...baseItems,
        { id: 'recipes', label: 'Recipes', Icon: MdRestaurantMenu, color: '#667eea' },
        { id: 'inprogress', label: 'Cooking', Icon: FaFire, color: '#667eea' },
        { id: 'cooking', label: 'Finished Goods', Icon: GiCookingPot, color: '#667eea' },
        { id: 'semifinished', label: 'Semi-Finished', Icon: BiError, color: '#667eea' },
        { id: 'lossgoods', label: 'Loss Goods', Icon: MdError, color: '#ff4757' },
        { id: 'inventory', label: 'Raw Materials', Icon: MdInventory, color: '#667eea' },
        { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
      ];
    } else if (role === 'Staff' || role === 'Waiter') {
      return [
        ...baseItems,
        { id: 'recipes', label: 'Recipes', Icon: MdRestaurantMenu, color: '#667eea' },
        { id: 'cooking', label: 'Finished Goods', Icon: GiCookingPot, color: '#667eea' },
        { id: 'inventory', label: 'Raw Materials', Icon: MdInventory, color: '#667eea' },
        { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
      ];
    } else {
      // Default fallback
      return [
        ...baseItems,
        { id: 'settings', label: 'Settings', Icon: MdSettings, color: '#667eea' }
      ];
    }
  };

  const navItems = getNavItemsForRole(userRole);

  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="min-h-full w-64 text-white flex flex-col shadow-2xl relative sidebar-animated" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
        backgroundSize: '400% 400%',
        overflow: 'hidden'
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
        <div className="flex-1 relative z-10" style={{
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              .sidebar-menu::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
              }
            `
          }} />
          <div className="sidebar-menu p-4">
            <ul className="menu gap-2">
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
                      <li>
                        <a
                          onClick={() => {
                            setActiveTab('stock-logs-report');
                            if (window.innerWidth < 1024) {
                              document.getElementById('my-drawer').checked = false;
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                            activeTab === 'stock-logs-report'
                              ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                              : 'text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                          }`}
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          <MdHistory className="text-lg" />
                          <span className="font-medium">Stock Logs</span>
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            setActiveTab('transfer-report');
                            if (window.innerWidth < 1024) {
                              document.getElementById('my-drawer').checked = false;
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                            activeTab === 'transfer-report'
                              ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                              : 'text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                          }`}
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          <MdSwapHoriz className="text-lg" />
                          <span className="font-medium">Transfer Report</span>
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
          </div>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-white/20 relative z-10">
          <button
            onClick={onLogout}
            className="w-full gap-2 px-4 py-3 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20 font-medium flex items-center justify-center"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <BiLogOut className="text-lg" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
