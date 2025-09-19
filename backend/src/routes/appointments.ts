import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, appointmentValidation } from '../middleware/validation.middleware';

const router = Router();

/**
 * Appointment routes
 * All routes are prefixed with /api/v1/appointments
 */

// Public routes (no authentication required)
router.get('/available-slots', AppointmentController.getAvailableSlots);

// User appointment routes (authentication required)
router.post('/', authenticate, validate(appointmentValidation.create), AppointmentController.createAppointment);
router.get('/', authenticate, AppointmentController.getUserAppointments);
router.get('/:id', authenticate, AppointmentController.getAppointmentById);
router.put('/:id/cancel', authenticate, AppointmentController.cancelAppointment);

// Staff appointment management routes (Staff/Admin only)
router.get('/all', authenticate, authorize(['staff', 'admin']), AppointmentController.getAllAppointments);
router.put('/:id', authenticate, authorize(['staff', 'admin']), AppointmentController.updateAppointment);
router.put('/:id/confirm', authenticate, authorize(['staff', 'admin']), AppointmentController.confirmAppointment);
router.put('/:id/reject', authenticate, authorize(['staff', 'admin']), AppointmentController.rejectAppointment);
router.put('/:id/complete', authenticate, authorize(['staff', 'admin']), AppointmentController.completeAppointment);

// Admin appointment statistics (Admin only)
router.get('/statistics', authenticate, authorize(['admin']), AppointmentController.getAppointmentStatistics);

export default router;
