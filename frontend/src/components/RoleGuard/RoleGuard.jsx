import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleGuard component
 * Conditionally renders children if the current user has the required permission or role.
 * 
 * Usage:
 * <RoleGuard module="finance" fallback={<p>Ruxsat yo'q</p>}>
 *   <FinancialReport />
 * </RoleGuard>
 * 
 * <RoleGuard roles={['owner', 'doctor']}>
 *   <DoctorButton />
 * </RoleGuard>
 */
export function RoleGuard({ module, roles, children, fallback = null }) {
  const { user, canAccess, hasRole } = useAuth();

  if (!user) return fallback;

  if (module && !canAccess(module)) {
    return fallback;
  }

  if (roles && !hasRole(roles)) {
    return fallback;
  }

  return <>{children}</>;
}

export default RoleGuard;
