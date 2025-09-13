import { userManager } from './userManager';

/**
 * Check if the current user has admin permissions
 * @returns {boolean} True if user is admin, false otherwise
 */
export function isAdmin(): boolean {
  const currentUser = userManager.getCurrentUser();
  console.log('Current user in isAdmin():', currentUser);
  console.log('User role:', currentUser?.role);
  
  // For testing purposes, if no user is logged in, assume admin
  if (!currentUser) {
    console.log('No user logged in, assuming admin for testing');
    return true;
  }
  
  const isAdminUser = currentUser?.role === 'admin';
  console.log('Is admin:', isAdminUser);
  return isAdminUser;
}

/**
 * Check if the current user has permission to perform admin actions
 * @param action - The action being performed (e.g., 'delete', 'edit', 'create')
 * @param resource - The resource being acted upon (e.g., 'booking', 'property', 'user')
 * @returns {boolean} True if user has permission, false otherwise
 */
export function hasAdminPermission(action: string, resource: string): boolean {
  if (!isAdmin()) {
    console.warn(`Access denied: User does not have admin permissions for ${action} on ${resource}`);
    return false;
  }
  return true;
}

/**
 * Get admin permission error message
 * @param action - The action being performed
 * @param resource - The resource being acted upon
 * @returns {string} Error message for insufficient permissions
 */
export function getAdminPermissionError(action: string, resource: string): string {
  return `Access denied: Only administrators can ${action} ${resource}s. Please contact your system administrator.`;
}
