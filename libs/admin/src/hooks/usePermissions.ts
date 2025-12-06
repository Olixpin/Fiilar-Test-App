import { useMemo, useCallback } from 'react';
import { User, AdminRole, Permission, PERMISSIONS, DEFAULT_ADMIN_ROLES, getRolePermissions } from '@fiilar/types';

interface UsePermissionsReturn {
  // Permission checks
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  
  // Role checks
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentRole: AdminRole | null;
  
  // Data access
  userPermissions: string[];
  allPermissions: Permission[];
  allRoles: AdminRole[];
  
  // Helpers
  getPermissionsByCategory: (category: string) => Permission[];
  getRoleById: (roleId: string) => AdminRole | undefined;
  canManageRole: (targetRoleId: string) => boolean;
}

/**
 * Hook for checking admin permissions
 * @param currentUser - The currently logged in user
 * @param customRoles - Optional custom roles (if stored in DB)
 */
export const usePermissions = (
  currentUser: User | null | undefined,
  customRoles?: AdminRole[]
): UsePermissionsReturn => {
  
  // Merge default roles with any custom roles from DB
  const allRoles = useMemo(() => {
    const roles = [...DEFAULT_ADMIN_ROLES];
    if (customRoles) {
      // Override default roles with custom ones, add new ones
      customRoles.forEach(customRole => {
        const existingIndex = roles.findIndex(r => r.id === customRole.id);
        if (existingIndex >= 0) {
          roles[existingIndex] = customRole;
        } else {
          roles.push(customRole);
        }
      });
    }
    return roles.sort((a, b) => b.priority - a.priority);
  }, [customRoles]);

  // Get user's current role
  const currentRole = useMemo(() => {
    if (!currentUser?.adminRoleId) return null;
    return allRoles.find(r => r.id === currentUser.adminRoleId) || null;
  }, [currentUser?.adminRoleId, allRoles]);

  // Combine role permissions with any individual overrides
  const userPermissions = useMemo(() => {
    const rolePermissions = currentRole ? getRolePermissions(currentRole.id) : [];
    const individualPermissions = currentUser?.adminPermissions || [];
    
    // Merge and dedupe
    return [...new Set([...rolePermissions, ...individualPermissions])];
  }, [currentRole, currentUser?.adminPermissions]);

  // Check if user is any kind of admin
  const isAdmin = useMemo(() => {
    return currentUser?.role === 'ADMIN' || !!currentUser?.adminRoleId;
  }, [currentUser]);

  // Check if user is super admin (explicit role OR legacy ADMIN without specific role)
  const isSuperAdmin = useMemo(() => {
    // Users with super_admin role
    if (currentUser?.adminRoleId === 'super_admin') return true;
    // Legacy admins (role: ADMIN but no specific adminRoleId) get super admin access
    if (currentUser?.role === 'ADMIN' && !currentUser?.adminRoleId) return true;
    return false;
  }, [currentUser?.adminRoleId, currentUser?.role]);

  // Check single permission
  const hasPermission = useCallback((permissionId: string): boolean => {
    if (isSuperAdmin) return true; // Super admin has all permissions
    return userPermissions.includes(permissionId);
  }, [userPermissions, isSuperAdmin]);

  // Check if user has ANY of the specified permissions
  const hasAnyPermission = useCallback((permissionIds: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionIds.some(id => userPermissions.includes(id));
  }, [userPermissions, isSuperAdmin]);

  // Check if user has ALL of the specified permissions
  const hasAllPermissions = useCallback((permissionIds: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionIds.every(id => userPermissions.includes(id));
  }, [userPermissions, isSuperAdmin]);

  // Get permissions by category
  const getPermissionsByCategory = useCallback((category: string): Permission[] => {
    return PERMISSIONS.filter(p => p.category === category);
  }, []);

  // Get role by ID
  const getRoleById = useCallback((roleId: string): AdminRole | undefined => {
    return allRoles.find(r => r.id === roleId);
  }, [allRoles]);

  // Check if current user can manage another role (based on priority)
  const canManageRole = useCallback((targetRoleId: string): boolean => {
    if (isSuperAdmin) return true;
    if (!currentRole) return false;
    
    const targetRole = getRoleById(targetRoleId);
    if (!targetRole) return false;
    
    // Can only manage roles with lower priority
    return currentRole.priority > targetRole.priority;
  }, [currentRole, isSuperAdmin, getRoleById]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    currentRole,
    userPermissions,
    allPermissions: PERMISSIONS,
    allRoles,
    getPermissionsByCategory,
    getRoleById,
    canManageRole,
  };
};

export default usePermissions;
