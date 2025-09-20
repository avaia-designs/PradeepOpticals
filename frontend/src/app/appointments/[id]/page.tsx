'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { AppointmentService } from '@/lib/services/appointment.service';
import { Appointment } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const appointmentData = await AppointmentService.getAppointmentById(appointmentId);
      setAppointment(appointmentData);
    } catch (error: any) {
      setError(error.message || 'Failed to load appointment');
      toast.error('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    
    try {
      await AppointmentService.cancelAppointment(appointment._id, cancelReason || 'Cancelled by user');
      toast.success('Appointment cancelled successfully');
      setIsCancelDialogOpen(false);
      setCancelReason('');
      loadAppointment(); // Refresh the appointment data
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.icon : AlertCircle;
  };

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.color : 'bg-gray-100 text-gray-800';
  };

  const canCancelAppointment = (status: string) => {
    return ['pending', 'confirmed'].includes(status);
  };

  const canRescheduleAppointment = (status: string) => {
    return ['pending', 'confirmed'].includes(status);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The appointment you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <Button asChild>
            <Link href="/appointments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(appointment.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link href="/appointments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
            <div className="flex gap-2">
              {/* {canRescheduleAppointment(appointment.status) && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
              )} */}
              {canCancelAppointment(appointment.status) && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <label className="text-sm font-medium text-gray-700">
                        Reason for cancellation (optional)
                      </label>
                      <textarea
                        className="mt-2 w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={3}
                        placeholder="Please provide a reason for cancelling this appointment..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                        Keep Appointment
                      </Button>
                      <Button variant="destructive" onClick={handleCancelAppointment}>
                        Cancel Appointment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold">Appointment Details</h1>
          <p className="text-gray-600 mt-2">
            {appointment.appointmentNumber} • {formatDate(appointment.appointmentDate)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Appointment Number</label>
                    <p className="text-lg font-semibold">{appointment.appointmentNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(appointment.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <p className="text-lg">{formatDate(appointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Time</label>
                    <p className="text-lg">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Reason for Appointment</label>
                  <p className="text-lg">{appointment.reason}</p>
                </div>

                {appointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <p className="text-lg">{appointment.notes}</p>
                  </div>
                )}

                {appointment.cancelledReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cancellation Reason</label>
                    <p className="text-lg text-red-600">{appointment.cancelledReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg">{appointment.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg">{appointment.customerEmail}</p>
                  </div>
                </div>

                {appointment.customerPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg">{appointment.customerPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-4">
                    <StatusIcon className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {appointment.status === 'pending' && 'Your appointment is awaiting confirmation from our staff.'}
                    {appointment.status === 'confirmed' && 'Your appointment has been confirmed. Please arrive on time.'}
                    {appointment.status === 'completed' && 'Your appointment has been completed successfully.'}
                    {appointment.status === 'cancelled' && 'This appointment has been cancelled.'}
                    {appointment.status === 'no_show' && 'You did not show up for this appointment.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Arrival Time</p>
                    <p className="text-sm text-gray-600">Please arrive 10 minutes before your appointment time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cancellation Policy</p>
                    <p className="text-sm text-gray-600">Please cancel at least 24 hours in advance to avoid any charges.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contact Us</p>
                    <p className="text-sm text-gray-600">Call us at (555) 123-4567 for any questions.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Appointment Created</p>
                      <p className="text-xs text-gray-600">{formatDate(appointment.createdAt)}</p>
                    </div>
                  </div>
                  
                  {appointment.confirmedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Appointment Confirmed</p>
                        <p className="text-xs text-gray-600">{formatDate(appointment.confirmedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {appointment.cancelledAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Appointment Cancelled</p>
                        <p className="text-xs text-gray-600">{formatDate(appointment.cancelledAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {appointment.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Appointment Completed</p>
                        <p className="text-xs text-gray-600">{formatDate(appointment.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
