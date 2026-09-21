import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component
 * Validates user authentication and required module permission before rendering route content.
 */
export function ProtectedRoute({ module, roles, children }) {
  const { user, isAuthenticated, canAccess, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (module && !canAccess(module)) {
    return <Navigate to="/app" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
