import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import ForceChangePassword from '../ForceChangePassword/ForceChangePassword';

/**
 * ProtectedRoute component
 * Validates user authentication and required module permission before rendering route content.
 * Enforces mandatory password change: if mustChangePassword is true, renders exclusively the
 * password change view, blocking access to all application routes.
 */
export function ProtectedRoute({ module, roles, children }) {
  const { user, isAuthenticated, canAccess, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mandatory password change gatekeeper
  if (user.mustChangePassword) {
    return <ForceChangePassword />;
  }

  const defaultRedirect = user.role === 'superadmin' ? '/superadmin' : '/dashboard';

  if (module && !canAccess(module)) {
    return <Navigate to={defaultRedirect} replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
