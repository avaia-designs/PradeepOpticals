import { apiClient } from '../api-client';
import { Appointment, PaginatedResult, AppointmentForm, TimeSlot } from '@/types';
import { ErrorHandler } from '../utils/error-handler';

export class AppointmentService {
  /**
   * Create new appointment
   */
  static async createAppointment(data: AppointmentForm): Promise<Appointment> {
    try {
      const response = await apiClient.post<Appointment>('/appointments', data);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'create');
      throw error;
    }
  }

  /**
   * Get user appointments
   */
  static async getUserAppointments(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Appointment>> {
    try {
      const response = await apiClient.get<Appointment[]>(
        `/appointments?page=${page}&limit=${limit}`
      );
      
      // Extract data and pagination from the API response structure
      return {
        data: response.data,  // Backend returns appointments array in data
        pagination: response.meta?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      ErrorHandler.handleAppointmentError(error, 'fetch');
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await apiClient.get<Appointment>(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'fetch');
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    try {
      const response = await apiClient.put<Appointment>(`/appointments/${id}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'cancel');
      throw error;
    }
  }

  /**
   * Get available time slots for a date
   */
  static async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    try {
      const response = await apiClient.get<TimeSlot[]>(`/appointments/available-slots?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      ErrorHandler.handleAppointmentError(error, 'fetch slots');
      throw error;
    }
  }

  /**
   * Get appointment statistics (Admin only)
   */
  static async getAppointmentStatistics(): Promise<any> {
    try {
      const response = await apiClient.get('/appointments/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
      ErrorHandler.handleAppointmentError(error, 'fetch statistics');
      throw error;
    }
  }
}
