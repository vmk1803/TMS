/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * This module provides utility functions to check user permissions
 * based on their user_type from the authentication response.
 */

export interface User {
    id: number;
    guid: string;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    [key: string]: any;
}

/**
 * User type constants
 */
export const UserTypes = {
    LAB_SUPER_ADMIN: 'LAB SUPER ADMIN',
    LAB_ADMIN: 'LAB ADMIN',
    TECHNICIAN: 'TECHNICIAN',
    TECHNICIAN_LEAD: 'TECHNICIAN LEAD',
    ORDERING_FACILITY_ADMIN: 'ORDERING FACILITY ADMIN',
} as const;

/**
 * Get user data from localStorage
 */
export function getUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr) as User;
    } catch (error) {
        return null;
    }
}

/**
 * Get current user's type
 */
export function getUserType(): string | null {
    const user = getUserFromStorage();
    return user?.user_type || null;
}

/**
 * Check if user has full access (LAB SUPER ADMIN)
 */
export function hasFullAccess(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_SUPER_ADMIN;
}

/**
 * Check if user can create records
 */
export function canCreate(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_SUPER_ADMIN || userType === UserTypes.TECHNICIAN;
}

/**
 * Check if user can edit records
 */
export function canEdit(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_SUPER_ADMIN || userType === UserTypes.TECHNICIAN;
}

/**
 * Check if user can delete records
 */
export function canDelete(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_SUPER_ADMIN || userType === UserTypes.TECHNICIAN;
}

/**
 * Check if user can assign orders
 * LAB ADMIN and TECHNICIAN can assign
 */
export function canAssign(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_SUPER_ADMIN || userType === UserTypes.LAB_ADMIN || userType === UserTypes.TECHNICIAN;
}

/**
 * Check if user can view map features
 * LAB ADMIN and TECHNICIAN can view map
 */
export function canViewMap(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_SUPER_ADMIN || userType === UserTypes.LAB_ADMIN || userType === UserTypes.TECHNICIAN;
}

/**
 * Check if user can perform administrative actions
 */
export function canPerformAdminActions(): boolean {
    return hasFullAccess();
}

/**
 * Check if user is read-only (LAB ADMIN only)
 */
export function isReadOnly(): boolean {
    const userType = getUserType();
    return userType === UserTypes.LAB_ADMIN;
}

/**
 * Check if user can create orders
 * Only LAB SUPER ADMIN can create orders
 */
export function canCreateOrder(): boolean {
    return hasFullAccess();
}
