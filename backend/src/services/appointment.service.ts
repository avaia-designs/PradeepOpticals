import { Appointment, IAppointmentDocument, IAppointment } from '../models';
import { PaginatedResult, AppointmentStatus } from '../types';
import { Logger } from '../utils/logger';

export interface CreateAppointmentData {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
  notes?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  staffId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class AppointmentService {
  /**
   * Create new appointment
   */
  static async createAppointment(data: CreateAppointmentData): Promise<IAppointment> {
    try {
      Logger.info('Creating new appointment', { 
        userId: data.userId, 
        customerEmail: data.customerEmail,
        appointmentDate: data.appointmentDate 
      });

      // Check for time conflicts
      const hasConflict = await this.checkTimeConflict(
        data.appointmentDate,
        data.startTime,
        data.endTime
      );

      if (hasConflict) {
        throw new Error('Time slot is not available');
      }

      // Generate appointment number
      const appointmentNumber = this.generateAppointmentNumber();

      const appointment = new Appointment({
        ...data,
        appointmentNumber,
        status: 'pending'
      });

      await appointment.save();

      Logger.info('Appointment created successfully', { 
        appointmentId: appointment._id, 
        appointmentNumber 
      });
      return appointment;
    } catch (error) {
      Logger.error('Failed to create appointment', error as Error);
      throw error;
    }
  }

  /**
   * Get appointments by user
   */
  static async getAppointmentsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    try {
      Logger.info('Fetching appointments by user', { userId, page, limit });

      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        Appointment.find({ userId })
          .sort({ appointmentDate: -1, startTime: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Appointment.countDocuments({ userId }).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('User appointments fetched successfully', { userId, count: appointments.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch user appointments', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get all appointments (Staff/Admin only)
   */
  static async getAllAppointments(
    page: number = 1,
    limit: number = 20,
    filters: AppointmentFilters = {}
  ): Promise<PaginatedResult<any>> {
    try {
      Logger.info('Fetching all appointments', { page, limit, filters });

      const skip = (page - 1) * limit;
      const query: any = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.staffId) {
        query.staffId = filters.staffId;
      }
      if (filters.dateFrom || filters.dateTo) {
        query.appointmentDate = {};
        if (filters.dateFrom) {
          query.appointmentDate.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          query.appointmentDate.$lte = filters.dateTo;
        }
      }

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .sort({ appointmentDate: 1, startTime: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Appointment.countDocuments(query).exec()
      ]);

      const result: PaginatedResult<any> = {
        data: appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      Logger.info('All appointments fetched successfully', { count: appointments.length });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch all appointments', error as Error);
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: string): Promise<any> {
    try {
      Logger.info('Fetching appointment by ID', { appointmentId: id });

      const appointment = await Appointment.findById(id).lean().exec();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      Logger.info('Appointment fetched successfully', { appointmentId: id });
      return appointment;
    } catch (error) {
      Logger.error('Failed to fetch appointment', error as Error, { appointmentId: id });
      throw error;
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(id: string, updateData: any): Promise<any> {
    try {
      Logger.info('Updating appointment', { appointmentId: id });

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Check for time conflicts if time is being changed
      if (updateData.appointmentDate || updateData.startTime || updateData.endTime) {
        const appointmentDate = updateData.appointmentDate || appointment.appointmentDate;
        const startTime = updateData.startTime || appointment.startTime;
        const endTime = updateData.endTime || appointment.endTime;

        const hasConflict = await this.checkTimeConflict(
          appointmentDate,
          startTime,
          endTime,
          id // Exclude current appointment from conflict check
        );

        if (hasConflict) {
          throw new Error('Time slot is not available');
        }
      }

      Object.assign(appointment, updateData);
      await appointment.save();

      Logger.info('Appointment updated successfully', { appointmentId: id });
      return appointment;
    } catch (error) {
      Logger.error('Failed to update appointment', error as Error, { appointmentId: id });
      throw error;
    }
  }

  /**
   * Confirm appointment (Staff/Admin only)
   */
  static async confirmAppointment(id: string, staffId: string): Promise<any> {
    try {
      Logger.info('Confirming appointment', { appointmentId: id, staffId });

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'pending') {
        throw new Error('Only pending appointments can be confirmed');
      }

      appointment.status = 'confirmed';
      appointment.staffId = staffId;
      appointment.confirmedAt = new Date();

      await appointment.save();

      Logger.info('Appointment confirmed successfully', { appointmentId: id, staffId });
      return appointment;
    } catch (error) {
      Logger.error('Failed to confirm appointment', error as Error, { appointmentId: id });
      throw error;
    }
  }

  /**
   * Reject appointment (Staff/Admin only)
   */
  static async rejectAppointment(id: string, reason?: string): Promise<any> {
    try {
      Logger.info('Rejecting appointment', { appointmentId: id, reason });

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'pending') {
        throw new Error('Only pending appointments can be rejected');
      }

      appointment.status = 'cancelled';
      appointment.cancelledAt = new Date();
      if (reason) {
        appointment.cancelledReason = reason;
      }

      await appointment.save();

      Logger.info('Appointment rejected successfully', { appointmentId: id });
      return appointment;
    } catch (error) {
      Logger.error('Failed to reject appointment', error as Error, { appointmentId: id });
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: string, reason?: string): Promise<any> {
    try {
      Logger.info('Cancelling appointment', { appointmentId: id, reason });

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (['cancelled', 'completed'].includes(appointment.status)) {
        throw new Error('Appointment cannot be cancelled');
      }

      appointment.status = 'cancelled';
      appointment.cancelledAt = new Date();
      if (reason) {
        appointment.cancelledReason = reason;
      }

      await appointment.save();

      Logger.info('Appointment cancelled successfully', { appointmentId: id });
      return appointment;
    } catch (error) {
      Logger.error('Failed to cancel appointment', error as Error, { appointmentId: id });
      throw error;
    }
  }

  /**
   * Complete appointment (Staff/Admin only)
   */
  static async completeAppointment(id: string): Promise<any> {
    try {
      Logger.info('Completing appointment', { appointmentId: id });

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'confirmed') {
        throw new Error('Only confirmed appointments can be completed');
      }

      appointment.status = 'completed';
      appointment.completedAt = new Date();

      await appointment.save();

      Logger.info('Appointment completed successfully', { appointmentId: id });
      return appointment;
    } catch (error) {
      Logger.error('Failed to complete appointment', error as Error, { appointmentId: id });
      throw error;
    }
  }

  /**
   * Get available time slots for a date
   */
  static async getAvailableSlots(date: Date): Promise<Array<{ startTime: string; endTime: string }>> {
    try {
      Logger.info('Fetching available slots', { date });

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get existing appointments for the date
      const existingAppointments = await Appointment.find({
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['pending', 'confirmed'] }
      }).lean().exec();

      // Generate available slots (9 AM to 5 PM, 30-minute intervals)
      const slots = [];
      const startHour = 9;
      const endHour = 17;
      const slotDuration = 30; // minutes

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endTime = `${hour.toString().padStart(2, '0')}:${(minute + slotDuration).toString().padStart(2, '0')}`;

          // Check if this slot is available
          const isAvailable = !existingAppointments.some((apt: IAppointmentDocument) => {
            return apt.startTime === startTime || 
                   (apt.startTime < endTime && apt.endTime > startTime);
          });

          if (isAvailable) {
            slots.push({ startTime, endTime });
          }
        }
      }

      Logger.info('Available slots fetched successfully', { date, count: slots.length });
      return slots;
    } catch (error) {
      Logger.error('Failed to fetch available slots', error as Error, { date });
      throw error;
    }
  }

  /**
   * Get appointment statistics (Admin only)
   */
  static async getAppointmentStatistics(): Promise<any> {
    try {
      Logger.info('Fetching appointment statistics');

      const [
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments
      ] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'confirmed' }),
        Appointment.countDocuments({ status: 'completed' }),
        Appointment.countDocuments({ status: 'cancelled' }),
        Appointment.countDocuments({ status: 'no_show' })
      ]);

      const statistics = {
        totalAppointments,
        statusBreakdown: {
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          noShow: noShowAppointments
        }
      };

      Logger.info('Appointment statistics fetched successfully');
      return statistics;
    } catch (error) {
      Logger.error('Failed to fetch appointment statistics', error as Error);
      throw error;
    }
  }

  /**
   * Check for time conflicts
   */
  private static async checkTimeConflict(
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const conflictingAppointments = await Appointment.find(query).lean().exec();
    return conflictingAppointments.length > 0;
  }

  /**
   * Generate unique appointment number
   */
  private static generateAppointmentNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `APT-${timestamp}-${random}`.toUpperCase();
  }
}