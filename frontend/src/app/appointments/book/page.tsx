'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/stores/user-store';
import { AppointmentService } from '@/lib/services/appointment.service';
import { TimeSlot } from '@/types';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const appointmentSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().optional(),
  appointmentDate: z.date(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  reason: z.string().min(10, 'Please provide a reason for your visit'),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function BookAppointmentPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useUserStore();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.profile?.phone || '',
    },
  });

  const appointmentDate = watch('appointmentDate');
  const startTime = watch('startTime');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (appointmentDate) {
      loadAvailableSlots(appointmentDate);
    }
  }, [appointmentDate]);

  const loadAvailableSlots = async (date: Date) => {
    try {
      setLoadingSlots(true);
      const slots = await AppointmentService.getAvailableSlots(date.toISOString());
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Failed to load available slots');
      console.error('Error loading slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setValue('appointmentDate', date);
    }
    setValue('startTime', '');
    setValue('endTime', '');
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setValue('startTime', timeSlot.startTime);
    setValue('endTime', timeSlot.endTime);
  };

  const onSubmit = async (data: AppointmentForm) => {
    try {
      setIsSubmitting(true);
      const appointment = await AppointmentService.createAppointment({
        ...data,
        appointmentDate: data.appointmentDate.toISOString(),
      });
      toast.success('Appointment booked successfully!');
      router.push(`/appointments/${appointment._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Appointment Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      {...register('customerName')}
                      className={errors.customerName ? 'border-red-500' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email Address *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      {...register('customerEmail')}
                      className={errors.customerEmail ? 'border-red-500' : ''}
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.customerEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      {...register('customerPhone')}
                    />
                  </div>

                  <div>
                    <Label>Reason for Visit *</Label>
                    <Textarea
                      {...register('reason')}
                      placeholder="Please describe the reason for your appointment..."
                      className={errors.reason ? 'border-red-500' : ''}
                      rows={3}
                    />
                    {errors.reason && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.reason.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Any additional information you'd like to share..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Date and Time Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Appointment Date *</Label>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0; // Disable past dates and Sundays
                      }}
                      className="rounded-md border"
                    />
                    {errors.appointmentDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.appointmentDate.message}
                      </p>
                    )}
                  </div>

                  {appointmentDate && (
                    <div>
                      <Label>Available Time Slots</Label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading available slots...</span>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {availableSlots.map((slot, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant={startTime === slot.startTime ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleTimeSelect(slot)}
                              className="justify-start"
                            >
                              {slot.startTime} - {slot.endTime}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 py-4">
                          No available slots for this date. Please select another date.
                        </p>
                      )}
                    </div>
                  )}

                  {startTime && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Selected Time:</strong> {startTime} - {watch('endTime')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Appointment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p>30 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p>Monday - Saturday: 9:00 AM - 5:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Advance Booking</p>
                      <p>Book up to 30 days in advance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !startTime}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking Appointment...
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
