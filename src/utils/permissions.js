// Role-based permissions system
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  KITCHEN: 'kitchen',
  STORE: 'store'
};

export const PERMISSIONS = {
  // Page access permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_DEPARTMENTS: 'view_departments',
  VIEW_USERS: 'view_users',
  VIEW_RECIPES: 'view_recipes',
  VIEW_INVENTORY: 'view_inventory',
  VIEW_COOKING: 'view_cooking',
  VIEW_FINISHED_GOODS: 'view_finished_goods',
  VIEW_SEMI_FINISHED: 'view_semi_finished',
  VIEW_ADJUSTED_RECIPES: 'view_adjusted_recipes',
  VIEW_LOSS_GOODS: 'view_loss_goods',
  VIEW_BULK_DATA: 'view_bulk_data',
  VIEW_REPORTS: 'view_reports',
  VIEW_SETTINGS: 'view_settings',

  // Action permissions
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  CREATE_RECIPE: 'create_recipe',
  EDIT_RECIPE: 'edit_recipe',
  DELETE_RECIPE: 'delete_recipe',
  CREATE_INVENTORY: 'create_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  CREATE_DEPARTMENT: 'create_department',
  EDIT_DEPARTMENT: 'edit_department',
  DELETE_DEPARTMENT: 'delete_department',
  DELETE_COOKING: 'delete_cooking',
  DELETE_FINISHED_GOODS: 'delete_finished_goods',
  DELETE_SEMI_FINISHED: 'delete_semi_finished',
  DELETE_ADJUSTED_RECIPES: 'delete_adjusted_recipes',
  DELETE_LOSS_GOODS: 'delete_loss_goods',
  BULK_OPERATIONS: 'bulk_operations'
};

// Role permissions mapping
const rolePermissions = {
  [ROLES.ADMIN]: [
    // All page access
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_RECIPES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_COOKING,
    PERMISSIONS.VIEW_FINISHED_GOODS,
    PERMISSIONS.VIEW_SEMI_FINISHED,
    PERMISSIONS.VIEW_ADJUSTED_RECIPES,
    PERMISSIONS.VIEW_LOSS_GOODS,
    PERMISSIONS.VIEW_BULK_DATA,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
    // All action permissions
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_RECIPE,
    PERMISSIONS.EDIT_RECIPE,
    PERMISSIONS.DELETE_RECIPE,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.DELETE_INVENTORY,
    PERMISSIONS.CREATE_DEPARTMENT,
    PERMISSIONS.EDIT_DEPARTMENT,
    PERMISSIONS.DELETE_DEPARTMENT,
    PERMISSIONS.DELETE_COOKING,
    PERMISSIONS.DELETE_FINISHED_GOODS,
    PERMISSIONS.DELETE_SEMI_FINISHED,
    PERMISSIONS.DELETE_ADJUSTED_RECIPES,
    PERMISSIONS.DELETE_LOSS_GOODS,
    PERMISSIONS.BULK_OPERATIONS
  ],

  [ROLES.MANAGER]: [
    // All page access (same as admin)
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_RECIPES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_COOKING,
    PERMISSIONS.VIEW_FINISHED_GOODS,
    PERMISSIONS.VIEW_SEMI_FINISHED,
    PERMISSIONS.VIEW_ADJUSTED_RECIPES,
    PERMISSIONS.VIEW_LOSS_GOODS,
    PERMISSIONS.VIEW_BULK_DATA,
    PERMISSIONS.VIEW_REPORTS,
    // Create and edit permissions (no delete permissions)
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.CREATE_RECIPE,
    PERMISSIONS.EDIT_RECIPE,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.CREATE_DEPARTMENT,
    PERMISSIONS.EDIT_DEPARTMENT,
    PERMISSIONS.BULK_OPERATIONS
  ],

  [ROLES.KITCHEN]: [
    PERMISSIONS.VIEW_RECIPES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_COOKING,
    PERMISSIONS.VIEW_FINISHED_GOODS,
    PERMISSIONS.VIEW_SEMI_FINISHED,
    PERMISSIONS.VIEW_LOSS_GOODS,
    PERMISSIONS.CREATE_RECIPE,
    PERMISSIONS.EDIT_RECIPE,
    PERMISSIONS.EDIT_INVENTORY
  ],

  [ROLES.STORE]: [
    PERMISSIONS.VIEW_RECIPES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY
  ]
};

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  // Admin has access to everything
  if (userRole === ROLES.ADMIN) return true;
  
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
};

// Check if user can access a page
export const canAccessPage = (userRole, page) => {
  // Admin has access to all pages
  if (userRole === ROLES.ADMIN) return true;
  
  const pagePermissionMap = {
    'dashboard': PERMISSIONS.VIEW_DASHBOARD,
    'analytics': PERMISSIONS.VIEW_ANALYTICS,
    'departments': PERMISSIONS.VIEW_DEPARTMENTS,
    'users': PERMISSIONS.VIEW_USERS,
    'recipes': PERMISSIONS.VIEW_RECIPES,
    'inventory': PERMISSIONS.VIEW_INVENTORY,
    'inprogress': PERMISSIONS.VIEW_COOKING,
    'cooking': PERMISSIONS.VIEW_FINISHED_GOODS,
    'semifinished': PERMISSIONS.VIEW_SEMI_FINISHED,
    'adjustedrecipes': PERMISSIONS.VIEW_ADJUSTED_RECIPES,
    'lossgoods': PERMISSIONS.VIEW_LOSS_GOODS,
    'bulk-data': PERMISSIONS.VIEW_BULK_DATA,
    'inventory-report': PERMISSIONS.VIEW_REPORTS,
    'recipe-report': PERMISSIONS.VIEW_REPORTS,
    'production-report': PERMISSIONS.VIEW_REPORTS,
    'revenue-report': PERMISSIONS.VIEW_REPORTS,
    'stock-logs-report': PERMISSIONS.VIEW_REPORTS,
    'transfer-report': PERMISSIONS.VIEW_REPORTS,
    'settings': PERMISSIONS.VIEW_SETTINGS
  };

  const requiredPermission = pagePermissionMap[page];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
};

// Check if user can perform delete operations
export const canDelete = (userRole, entityType) => {
  // Admin can delete everything
  if (userRole === ROLES.ADMIN) return true;
  
  const deletePermissionMap = {
    'user': PERMISSIONS.DELETE_USER,
    'recipe': PERMISSIONS.DELETE_RECIPE,
    'inventory': PERMISSIONS.DELETE_INVENTORY,
    'department': PERMISSIONS.DELETE_DEPARTMENT,
    'cooking': PERMISSIONS.DELETE_COOKING,
    'finished-goods': PERMISSIONS.DELETE_FINISHED_GOODS,
    'semi-finished': PERMISSIONS.DELETE_SEMI_FINISHED,
    'adjusted-recipes': PERMISSIONS.DELETE_ADJUSTED_RECIPES,
    'loss-goods': PERMISSIONS.DELETE_LOSS_GOODS
  };

  const requiredPermission = deletePermissionMap[entityType];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
};

// Check if user can create entities
export const canCreate = (userRole, entityType) => {
  // Admin can create everything
  if (userRole === ROLES.ADMIN) return true;
  
  const createPermissionMap = {
    'user': PERMISSIONS.CREATE_USER,
    'recipe': PERMISSIONS.CREATE_RECIPE,
    'inventory': PERMISSIONS.CREATE_INVENTORY,
    'department': PERMISSIONS.CREATE_DEPARTMENT
  };

  const requiredPermission = createPermissionMap[entityType];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
};

// Check if user can edit entities
export const canEdit = (userRole, entityType) => {
  // Admin can edit everything
  if (userRole === ROLES.ADMIN) return true;
  
  const editPermissionMap = {
    'user': PERMISSIONS.EDIT_USER,
    'recipe': PERMISSIONS.EDIT_RECIPE,
    'inventory': PERMISSIONS.EDIT_INVENTORY,
    'department': PERMISSIONS.EDIT_DEPARTMENT
  };

  const requiredPermission = editPermissionMap[entityType];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
};

// Check if user is admin (has complete access)
export const isAdmin = (userRole) => {
  return userRole === ROLES.ADMIN;
};

// Check if user can view all departments (admin and manager)
export const canViewAllDepartments = (userRole) => {
  return userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;
};

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  canAccessPage,
  canDelete,
  canCreate,
  canEdit
};