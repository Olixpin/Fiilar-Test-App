import React, { ReactNode } from 'react';
import { User } from '@fiilar/types';
import { usePermissions } from '../hooks/usePermissions';
import { ShieldAlert, Lock } from 'lucide-react';

interface PermissionGateProps {
  /** Single permission required */
  permission?: string;
  /** Multiple permissions - user needs ANY of these */
  anyPermission?: string[];
  /** Multiple permissions - user needs ALL of these */
  allPermissions?: string[];
  /** The currently logged in user */
  currentUser: User | null | undefined;
  /** Content to show when user has permission */
  children: ReactNode;
  /** What to show when user lacks permission. Defaults to nothing. */
  fallback?: ReactNode;
  /** Show a "no access" message instead of hiding */
  showDenied?: boolean;
  /** Custom message for denied state */
  deniedMessage?: string;
}

/**
 * PermissionGate - Conditionally render content based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="users.write" currentUser={user}>
 *   <EditUserButton />
 * </PermissionGate>
 * 
 * @example
 * // Any of multiple permissions
 * <PermissionGate anyPermission={['users.write', 'users.delete']} currentUser={user}>
 *   <UserActionsMenu />
 * </PermissionGate>
 * 
 * @example
 * // All permissions required
 * <PermissionGate allPermissions={['financials.read', 'financials.export']} currentUser={user}>
 *   <ExportFinancialsButton />
 * </PermissionGate>
 * 
 * @example
 * // With denied message
 * <PermissionGate permission="system.settings" currentUser={user} showDenied>
 *   <SystemSettings />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyPermission,
  allPermissions,
  currentUser,
  children,
  fallback = null,
  showDenied = false,
  deniedMessage = "You don't have permission to access this feature.",
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(currentUser);

  // Determine if user has access
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  } else {
    // No permission specified, allow by default
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Lock size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Access Denied</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">{deniedMessage}</p>
      </div>
    );
  }

  return <>{fallback}</>;
};

/**
 * Higher-order component version of PermissionGate
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string,
  getCurrentUser: (props: P) => User | null | undefined
) {
  return function WithPermissionComponent(props: P) {
    const currentUser = getCurrentUser(props);
    const { hasPermission } = usePermissions(currentUser);

    if (!hasPermission(permission)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Simple hook-based permission check for inline usage
 */
export const useHasPermission = (
  currentUser: User | null | undefined,
  permission: string
): boolean => {
  const { hasPermission } = usePermissions(currentUser);
  return hasPermission(permission);
};

export default PermissionGate;
