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
    const response = await apiClient.get<PaginatedResult<Appointment>>(
      `/appointments?page=${page}&limit=${limit}`
    );
    return response.data;
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
