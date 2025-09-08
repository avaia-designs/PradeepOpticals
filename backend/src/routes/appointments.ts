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

// Protected routes (authentication required)
router.use(authenticate);

// User appointment routes
router.post('/', validate(appointmentValidation.create), AppointmentController.createAppointment);
router.get('/', AppointmentController.getUserAppointments);
router.get('/:id', AppointmentController.getAppointmentById);
router.put('/:id/cancel', AppointmentController.cancelAppointment);

// Staff/Admin only routes
router.use(authorize('staff', 'admin'));

// Staff appointment management routes
router.get('/all', AppointmentController.getAllAppointments);
router.put('/:id', AppointmentController.updateAppointment);
router.put('/:id/confirm', AppointmentController.confirmAppointment);
router.put('/:id/reject', AppointmentController.rejectAppointment);
router.put('/:id/complete', AppointmentController.completeAppointment);

// Admin only routes
router.use(authorize('admin'));

// Admin appointment statistics
router.get('/statistics', AppointmentController.getAppointmentStatistics);

export default router;
