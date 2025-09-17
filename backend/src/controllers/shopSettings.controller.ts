import { Request, Response, NextFunction } from 'express';
import { ShopSettings } from '../models/ShopSettings';
import { ApiResponse } from '../types';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

/**
 * Get current shop settings
 */
export const getShopSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await ShopSettings.getCurrentSettings();

    const response: ApiResponse = {
      success: true,
      data: settings,
      message: 'Shop settings retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update shop settings (Admin only)
 */
export const updateShopSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    const {
      appointmentDuration,
      workingHours,
      workingDays,
      maxAdvanceBookingDays,
      slotInterval,
      isAppointmentBookingEnabled,
      maxAppointmentsPerDay,
      bufferTime
    } = req.body;

    const updates: any = {};

    if (appointmentDuration !== undefined) updates.appointmentDuration = appointmentDuration;
    if (workingHours !== undefined) updates.workingHours = workingHours;
    if (workingDays !== undefined) updates.workingDays = workingDays;
    if (maxAdvanceBookingDays !== undefined) updates.maxAdvanceBookingDays = maxAdvanceBookingDays;
    if (slotInterval !== undefined) updates.slotInterval = slotInterval;
    if (isAppointmentBookingEnabled !== undefined) updates.isAppointmentBookingEnabled = isAppointmentBookingEnabled;
    if (maxAppointmentsPerDay !== undefined) updates.maxAppointmentsPerDay = maxAppointmentsPerDay;
    if (bufferTime !== undefined) updates.bufferTime = bufferTime;

    const settings = await ShopSettings.updateSettings(updates);

    // Validate working hours
    if (!settings.validateWorkingHours()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'End time must be after start time'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: settings,
      message: 'Shop settings updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available appointment slots for a date
 */
export const getAvailableSlots = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Date parameter is required'
      });
    }

    const appointmentDate = new Date(date as string);
    
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid date format'
      });
    }

    const settings = await ShopSettings.getCurrentSettings();

    // Check if appointment booking is enabled
    if (!settings.isAppointmentBookingEnabled) {
      return res.status(400).json({
        success: false,
        error: 'BOOKING_DISABLED',
        message: 'Appointment booking is currently disabled'
      });
    }

    // Check if date is within advance booking limit
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + settings.maxAdvanceBookingDays);

    if (appointmentDate < today || appointmentDate > maxDate) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATE',
        message: `Date must be between today and ${maxDate.toISOString().split('T')[0]}`
      });
    }

    // Check if it's a working day
    const dayOfWeek = appointmentDate.getDay();
    if (!settings.workingDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        error: 'NON_WORKING_DAY',
        message: 'Appointments are not available on this day'
      });
    }

    // Generate available slots
    const availableSlots = settings.generateSlotsForDate(appointmentDate);

    const response: ApiResponse = {
      success: true,
      data: {
        date: appointmentDate.toISOString().split('T')[0],
        slots: availableSlots,
        settings: {
          appointmentDuration: settings.appointmentDuration,
          workingHours: settings.workingHours,
          slotInterval: settings.slotInterval
        }
      },
      message: 'Available slots retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset shop settings to default (Admin only)
 */
export const resetShopSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required.'
      });
    }

    // Delete existing settings and create new default ones
    await ShopSettings.deleteMany({});
    const settings = await ShopSettings.getCurrentSettings();

    const response: ApiResponse = {
      success: true,
      data: settings,
      message: 'Shop settings reset to default successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
