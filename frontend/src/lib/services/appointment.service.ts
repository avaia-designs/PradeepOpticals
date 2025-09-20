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
   * Get all appointments (Staff/Admin only)
   */
  static async getAllAppointments(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      staffId?: string;
    }
  ): Promise<PaginatedResult<Appointment>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.staffId) params.append('staffId', filters.staffId);

      const response = await apiClient.get<Appointment[]>(
        `/appointments/all?${params.toString()}`
      );
      
      return {
        data: response.data,
        pagination: response.meta?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      ErrorHandler.handleAppointmentError(error, 'fetch all');
      throw error;
    }
  }

  /**
   * Update appointment (Staff/Admin only)
   */
  static async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'update');
      throw error;
    }
  }

  /**
   * Confirm appointment (Staff/Admin only)
   */
  static async confirmAppointment(id: string): Promise<Appointment> {
    try {
      const response = await apiClient.put<Appointment>(`/appointments/${id}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'confirm');
      throw error;
    }
  }

  /**
   * Reject appointment (Staff/Admin only)
   */
  static async rejectAppointment(id: string, reason?: string): Promise<Appointment> {
    try {
      const response = await apiClient.put<Appointment>(`/appointments/${id}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'reject');
      throw error;
    }
  }

  /**
   * Complete appointment (Staff/Admin only)
   */
  static async completeAppointment(id: string): Promise<Appointment> {
    try {
      const response = await apiClient.put<Appointment>(`/appointments/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      ErrorHandler.handleAppointmentError(error, 'complete');
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
