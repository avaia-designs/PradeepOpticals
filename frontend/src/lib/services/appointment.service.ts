import { apiClient } from '../api-client';
import { Appointment, PaginatedResult, AppointmentForm, TimeSlot } from '@/types';

export class AppointmentService {
  /**
   * Create new appointment
   */
  static async createAppointment(data: AppointmentForm): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/appointments', data);
    return response.data;
  }

  /**
   * Get user appointments
   */
  static async getUserAppointments(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Appointment>> {
    const response = await apiClient.get<Appointment[]>(
      `/appointments?page=${page}&limit=${limit}`
    );
    
    // Extract data and pagination from the API response structure
    return {
      data: response.data,  // Backend returns appointments array in data
      pagination: response.meta?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
    };
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/appointments/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  /**
   * Get available time slots for a date
   */
  static async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    const response = await apiClient.get<TimeSlot[]>(`/appointments/available-slots?date=${date}`);
    return response.data;
  }

  /**
   * Get appointment statistics (Admin only)
   */
  static async getAppointmentStatistics(): Promise<any> {
    const response = await apiClient.get('/appointments/statistics');
    return response.data;
  }
}
