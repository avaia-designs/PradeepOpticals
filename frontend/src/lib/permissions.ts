/**
 * Role-based permission system
 * Defines permissions for different user roles
 */

export enum Permission {
  // User permissions
  VIEW_PRODUCTS = 'view:products',
  ADD_TO_CART = 'add:cart',
  CREATE_ORDER = 'create:order',
  VIEW_OWN_ORDERS = 'view:own_orders',
  BOOK_APPOINTMENT = 'book:appointment',
  VIEW_OWN_APPOINTMENTS = 'view:own_appointments',
  UPLOAD_PRESCRIPTION = 'upload:prescription',
  REQUEST_QUOTATION = 'request:quotation',

  // Staff permissions
  MANAGE_INVENTORY = 'manage:inventory',
  MANAGE_ORDERS = 'manage:orders',
  MANAGE_APPOINTMENTS = 'manage:appointments',
  MANAGE_QUOTATIONS = 'manage:quotations',
  VIEW_CUSTOMERS = 'view:customers',
  CREATE_WALKIN_ORDERS = 'create:walkin_orders',

  // Admin permissions
  MANAGE_USERS = 'manage:users',
  MANAGE_STAFF = 'manage:staff',
  MANAGE_SETTINGS = 'manage:settings',
  MANAGE_CATEGORIES = 'manage:categories',
  MANAGE_BRANDS = 'manage:brands',
  VIEW_ANALYTICS = 'view:analytics',
  MANAGE_SYSTEM = 'manage:system',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [
    Permission.VIEW_PRODUCTS,
    Permission.ADD_TO_CART,
    Permission.CREATE_ORDER,
    Permission.VIEW_OWN_ORDERS,
    Permission.BOOK_APPOINTMENT,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPLOAD_PRESCRIPTION,
    Permission.REQUEST_QUOTATION,
  ],
  staff: [
    // All user permissions
    Permission.VIEW_PRODUCTS,
    Permission.ADD_TO_CART,
    Permission.CREATE_ORDER,
    Permission.VIEW_OWN_ORDERS,
    Permission.BOOK_APPOINTMENT,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPLOAD_PRESCRIPTION,
    Permission.REQUEST_QUOTATION,
    // Staff specific permissions
    Permission.MANAGE_INVENTORY,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_APPOINTMENTS,
    Permission.MANAGE_QUOTATIONS,
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_WALKIN_ORDERS,
  ],
  admin: [
    // All permissions
    ...Object.values(Permission),
  ],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: string): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

/**
 * Check if user is staff or admin
 */
export function isStaffOrAdmin(userRole: string): boolean {
  return userRole === 'staff' || userRole === 'admin';
}

/**
 * Check if user is customer
 */
export function isCustomer(userRole: string): boolean {
  return userRole === 'user';
}
