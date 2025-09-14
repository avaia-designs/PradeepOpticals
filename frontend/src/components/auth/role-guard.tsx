'use client';

import React from 'react';
import { useUserStore } from '@/stores/user-store';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
  redirectTo = '/',
}: RoleGuardProps) {
  const { user, isAuthenticated } = useUserStore();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access this page.
          </p>
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check permissions
  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(user.role, permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(user.role, permissions)
      : hasAnyPermission(user.role, permissions);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={redirectTo}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check permissions in components
 */
export function usePermissions() {
  const { user } = useUserStore();

  return {
    hasPermission: (permission: Permission) => 
      user ? hasPermission(user.role, permission) : false,
    hasAnyPermission: (permissions: Permission[]) => 
      user ? hasAnyPermission(user.role, permissions) : false,
    hasAllPermissions: (permissions: Permission[]) => 
      user ? hasAllPermissions(user.role, permissions) : false,
    isAdmin: () => user?.role === 'admin',
    isStaff: () => user?.role === 'staff',
    isCustomer: () => user?.role === 'user',
    isStaffOrAdmin: () => user?.role === 'staff' || user?.role === 'admin',
  };
}
