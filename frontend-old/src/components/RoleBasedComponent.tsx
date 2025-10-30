import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleBasedComponentProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on user role
 */
export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook to check if current user has required role
 */
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  const isHR = (): boolean => hasRole(['hr', 'admin']);
  const isManager = (): boolean => hasRole(['hr', 'admin', 'manager']);
  const isEmployee = (): boolean => hasRole(['hr', 'admin', 'manager', 'employee']);

  return {
    user,
    hasRole,
    isHR,
    isManager,
    isEmployee,
  };
};

/**
 * Component for HR-only content
 */
export const HROnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleBasedComponent allowedRoles={['hr', 'admin']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

/**
 * Component for Manager and above content
 */
export const ManagerAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleBasedComponent allowedRoles={['hr', 'admin', 'manager']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

/**
 * Component for Employee and above content (essentially all authenticated users)
 */
export const EmployeeAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleBasedComponent allowedRoles={['hr', 'admin', 'manager', 'employee']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export default RoleBasedComponent;