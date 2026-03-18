import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { hasPermission, canDelete, canCreate, canEdit } from '../../utils/permissions';

const PermissionWrapper = ({ 
  children, 
  permission, 
  entityType, 
  action, 
  fallback = null,
  style = {},
  className = ''
}) => {
  const { user } = useUser();
  const userRole = user?.role || 'store';
  
  let hasAccess = false;

  if (permission) {
    // Direct permission check
    hasAccess = hasPermission(userRole, permission);
  } else if (entityType && action) {
    // Action-based permission check
    switch (action) {
      case 'delete':
        hasAccess = canDelete(userRole, entityType);
        break;
      case 'create':
        hasAccess = canCreate(userRole, entityType);
        break;
      case 'edit':
        hasAccess = canEdit(userRole, entityType);
        break;
      default:
        hasAccess = false;
    }
  }

  if (!hasAccess) {
    return fallback;
  }

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
};

export default PermissionWrapper;