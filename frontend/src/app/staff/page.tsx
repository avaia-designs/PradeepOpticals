'use client';

import React from 'react';
import { StaffLayout } from '@/components/layout/staff-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Clock,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function StaffDashboard() {
  const stats = [
    {
      name: 'Pending Orders',
      value: '12',
      change: '+3',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      href: '/staff/orders?status=pending',
    },
    {
      name: 'Today\'s Appointments',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: Calendar,
      href: '/staff/appointments?date=today',
    },
    {
      name: 'Pending Quotations',
      value: '5',
      change: '+1',
      changeType: 'positive' as const,
      icon: FileText,
      href: '/staff/quotations?status=pending',
    },
    {
      name: 'Low Stock Items',
      value: '3',
      change: '-2',
      changeType: 'negative' as const,
      icon: Package,
      href: '/staff/inventory?filter=low-stock',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'Order #ORD-20241201-1234 needs processing',
      description: 'Customer: John Doe - 2 items',
      time: '5 minutes ago',
      priority: 'high',
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Appointment #APT-20241201-5678 confirmed',
      description: 'Customer: Jane Smith - 2:00 PM today',
      time: '10 minutes ago',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'quotation',
      title: 'Quotation request needs review',
      description: 'Customer: Bob Johnson - Custom lenses',
      time: '30 minutes ago',
      priority: 'high',
    },
    {
      id: 4,
      type: 'inventory',
      title: 'Low stock alert',
      description: 'Ray-Ban Aviator - Only 2 left',
      time: '1 hour ago',
      priority: 'high',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Manage your daily tasks and operations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from yesterday</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  <Link href={stat.href} className="text-primary hover:text-primary/80">
                    View details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{activity.time}</span>
                        <Badge className={getPriorityColor(activity.priority)}>
                          {activity.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link href="/staff/orders/new">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    New Order
                  </Link>
                </Button>
                <Button asChild className="h-20 flex-col">
                  <Link href="/staff/appointments">
                    <Calendar className="h-6 w-6 mb-2" />
                    Manage Appointments
                  </Link>
                </Button>
                <Button asChild className="h-20 flex-col">
                  <Link href="/staff/quotations">
                    <FileText className="h-6 w-6 mb-2" />
                    Review Quotations
                  </Link>
                </Button>
                <Button asChild className="h-20 flex-col">
                  <Link href="/staff/inventory">
                    <Package className="h-6 w-6 mb-2" />
                    Manage Inventory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
}
