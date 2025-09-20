'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  User,
  Bell,
  Search,
} from 'lucide-react';
import { useUserStore } from '@/stores/user-store';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { NotificationBell } from '@/components/notifications/notification-bell';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: Permission.VIEW_ANALYTICS,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: Permission.MANAGE_USERS,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    permission: Permission.MANAGE_INVENTORY,
  },
  {
    name: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
    permission: Permission.MANAGE_APPOINTMENTS,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useUserStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <RoleGuard permission={Permission.MANAGE_SYSTEM}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-4">
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
              <nav className="flex-1 space-y-1 px-2 py-4">
                {adminNavigation.map((item) => (
                  <RoleGuard
                    key={item.name}
                    permission={item.permission}
                    fallback={null}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </RoleGuard>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-40">
          <div className="flex min-h-0 flex-1 flex-col bg-white border-r shadow-lg">
            <div className="flex h-16 items-center justify-between px-4 pt-32">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {adminNavigation.map((item) => (
                <RoleGuard
                  key={item.name}
                  permission={item.permission}
                  fallback={null}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </RoleGuard>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64">
          {/* Header */}
          

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
