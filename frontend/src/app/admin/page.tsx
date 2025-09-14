'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  ShoppingCart,
  Calendar,
  FileText,
  TrendingUp,
  Eye,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      href: '/admin/users',
    },
    {
      name: 'Total Products',
      value: '456',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Package,
      href: '/admin/products',
    },
    {
      name: 'Total Orders',
      value: '789',
      change: '+15%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      href: '/admin/orders',
    },
    {
      name: 'Appointments',
      value: '123',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Calendar,
      href: '/admin/appointments',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'New order #ORD-20241201-1234',
      description: 'Customer placed an order for 2 items',
      time: '2 minutes ago',
      status: 'pending',
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Appointment booked #APT-20241201-5678',
      description: 'John Doe booked an appointment for tomorrow',
      time: '15 minutes ago',
      status: 'confirmed',
    },
    {
      id: 3,
      type: 'quotation',
      title: 'Quotation request #QUO-20241201-9012',
      description: 'Customer requested quotation for custom lenses',
      time: '1 hour ago',
      status: 'pending',
    },
    {
      id: 4,
      type: 'user',
      title: 'New user registration',
      description: 'Jane Smith registered as a new customer',
      time: '2 hours ago',
      status: 'completed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
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
                  <span className="ml-1">from last month</span>
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
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
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
                <Eye className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link href="/admin/users">
                    <Users className="h-6 w-6 mb-2" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild className="h-20 flex-col">
                  <Link href="/admin/products">
                    <Package className="h-6 w-6 mb-2" />
                    Manage Products
                  </Link>
                </Button>
                <Button asChild className="h-20 flex-col">
                  <Link href="/admin/orders">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    View Orders
                  </Link>
                </Button>
                <Button asChild className="h-20 flex-col">
                  <Link href="/admin/appointments">
                    <Calendar className="h-6 w-6 mb-2" />
                    Manage Appointments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
