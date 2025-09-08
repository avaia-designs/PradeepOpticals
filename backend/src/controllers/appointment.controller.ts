import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthenticatedRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * Appointment controller
 * Handles appointment-related operations
 */
export class AppointmentController {
  /**
   * Create new appointment
   * POST /api/v1/appointments
   */
  static async createAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const appointmentData = {
        ...req.body,
        userId
      };

      const appointment = await AppointmentService.createAppointment(appointmentData);

      Logger.info('Appointment created successfully', { 
        appointmentId: appointment._id, 
        userId 
      });

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment created successfully'
      });
    } catch (error) {
      Logger.error('Failed to create appointment', error as Error);
      next(error);
    }
  }

  /**
   * Get user appointments
   * GET /api/v1/appointments
   */
  static async getUserAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await AppointmentService.getAppointmentsByUser(userId, page, limit);

      Logger.info('User appointments fetched successfully', { userId, count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Appointments retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch user appointments', error as Error);
      next(error);
    }
  }

  /**
   * Get all appointments (Staff/Admin only)
   * GET /api/v1/appointments/all
   */
  static async getAllAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters = {
        status: req.query.status as any,
        staffId: req.query.staffId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };

      const result = await AppointmentService.getAllAppointments(page, limit, filters);

      Logger.info('All appointments fetched successfully', { count: result.data.length });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        },
        message: 'Appointments retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch all appointments', error as Error);
      next(error);
    }
  }

  /**
   * Get appointment by ID
   * GET /api/v1/appointments/:id
   */
  static async getAppointmentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const appointment = await AppointmentService.getAppointmentById(id);

      // Check if user can access this appointment
      if (appointment.userId !== userId && !['staff', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied'
        });
        return;
      }

      Logger.info('Appointment fetched successfully', { appointmentId: id });

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch appointment', error as Error);
      next(error);
    }
  }

  /**
   * Update appointment (Staff/Admin only)
   * PUT /api/v1/appointments/:id
   */
  static async updateAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const appointment = await AppointmentService.updateAppointment(id, updateData);

      Logger.info('Appointment updated successfully', { appointmentId: id });

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment updated successfully'
      });
    } catch (error) {
      Logger.error('Failed to update appointment', error as Error);
      next(error);
    }
  }

  /**
   * Confirm appointment (Staff/Admin only)
   * PUT /api/v1/appointments/:id/confirm
   */
  static async confirmAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = req.user.id;

      const appointment = await AppointmentService.confirmAppointment(id, staffId);

      Logger.info('Appointment confirmed successfully', { appointmentId: id, staffId });

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment confirmed successfully'
      });
    } catch (error) {
      Logger.error('Failed to confirm appointment', error as Error);
      next(error);
    }
  }

  /**
   * Reject appointment (Staff/Admin only)
   * PUT /api/v1/appointments/:id/reject
   */
  static async rejectAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await AppointmentService.rejectAppointment(id, reason);

      Logger.info('Appointment rejected successfully', { appointmentId: id });

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment rejected successfully'
      });
    } catch (error) {
      Logger.error('Failed to reject appointment', error as Error);
      next(error);
    }
  }

  /**
   * Cancel appointment
   * PUT /api/v1/appointments/:id/cancel
   */
  static async cancelAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const appointment = await AppointmentService.getAppointmentById(id);

      // Check if user can cancel this appointment
      if (appointment.userId !== userId && !['staff', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied'
        });
        return;
      }

      const cancelledAppointment = await AppointmentService.cancelAppointment(id, reason);

      Logger.info('Appointment cancelled successfully', { appointmentId: id });

      res.status(200).json({
        success: true,
        data: cancelledAppointment,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      Logger.error('Failed to cancel appointment', error as Error);
      next(error);
    }
  }

  /**
   * Complete appointment (Staff/Admin only)
   * PUT /api/v1/appointments/:id/complete
   */
  static async completeAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const appointment = await AppointmentService.completeAppointment(id);

      Logger.info('Appointment completed successfully', { appointmentId: id });

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment completed successfully'
      });
    } catch (error) {
      Logger.error('Failed to complete appointment', error as Error);
      next(error);
    }
  }

  /**
   * Get available time slots for a date
   * GET /api/v1/appointments/available-slots
   */
  static async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date } = req.query;

      if (!date) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Date is required'
        });
        return;
      }

      const appointmentDate = new Date(date as string);
      const slots = await AppointmentService.getAvailableSlots(appointmentDate);

      Logger.info('Available slots fetched successfully', { date: appointmentDate, count: slots.length });

      res.status(200).json({
        success: true,
        data: slots,
        message: 'Available slots retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch available slots', error as Error);
      next(error);
    }
  }

  /**
   * Get appointment statistics (Admin only)
   * GET /api/v1/appointments/statistics
   */
  static async getAppointmentStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await AppointmentService.getAppointmentStatistics();

      Logger.info('Appointment statistics fetched successfully');

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Appointment statistics retrieved successfully'
      });
    } catch (error) {
      Logger.error('Failed to fetch appointment statistics', error as Error);
      next(error);
    }
  }
}
