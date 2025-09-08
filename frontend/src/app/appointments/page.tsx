'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, Plus, Eye, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppointmentService } from '@/lib/services/appointment.service';
import { Appointment } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAppointments = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await AppointmentService.getUserAppointments(page, 10);
      setAppointments(result.data);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      setError(error.message || 'Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(currentPage);
  }, [currentPage]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await AppointmentService.cancelAppointment(appointmentId, 'Cancelled by user');
      toast.success('Appointment cancelled successfully');
      loadAppointments(currentPage);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const canCancelAppointment = (status: string) => {
    return ['pending', 'confirmed'].includes(status);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      return appointmentDate > now && ['pending', 'confirmed'].includes(apt.status);
    });
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      return appointmentDate <= now || ['cancelled', 'completed', 'no_show'].includes(apt.status);
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Appointments</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => loadAppointments(currentPage)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Appointments Yet</h1>
          <p className="text-gray-600 mb-6">
            You haven't booked any appointments yet. Book your first appointment to get started.
          </p>
          <Button asChild>
            <Link href="/appointments/book">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <Button asChild>
          <Link href="/appointments/book">
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const StatusIcon = statusConfig[appointment.status].icon;
                
                return (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Appointment #{appointment.appointmentNumber}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
                          </p>
                        </div>
                        <Badge className={statusConfig[appointment.status].color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[appointment.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="mr-2 h-4 w-4" />
                              <span>{appointment.customerName}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="mr-2 h-4 w-4" />
                              <span>{appointment.customerEmail}</span>
                            </div>
                            {appointment.customerPhone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="mr-2 h-4 w-4" />
                                <span>{appointment.customerPhone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">Reason:</p>
                              <p>{appointment.reason}</p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/appointments/${appointment._id}`}>
                                <Eye className="mr-1 h-3 w-3" />
                                View Details
                              </Link>
                            </Button>
                            
                            {canCancelAppointment(appointment.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel Appointment
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => {
                const StatusIcon = statusConfig[appointment.status].icon;
                
                return (
                  <Card key={appointment._id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Appointment #{appointment.appointmentNumber}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
                          </p>
                        </div>
                        <Badge className={statusConfig[appointment.status].color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[appointment.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="mr-2 h-4 w-4" />
                              <span>{appointment.customerName}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="mr-2 h-4 w-4" />
                              <span>{appointment.customerEmail}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">Reason:</p>
                              <p>{appointment.reason}</p>
                            </div>
                          </div>
                        </div>

                        {appointment.cancelledReason && (
                          <div className="border-t pt-4">
                            <p className="text-sm text-red-600">
                              <span className="font-medium">Cancellation Reason:</span> {appointment.cancelledReason}
                            </p>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/appointments/${appointment._id}`}>
                                <Eye className="mr-1 h-3 w-3" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}