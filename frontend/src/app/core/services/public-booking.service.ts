import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Company, ProfessionalUser, Service, Appointment } from '../models/salon.models';
import { Observable } from 'rxjs';

export interface AvailableTimesResponse {
  slots: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PublicBookingService {
  private apiService = inject(ApiService);

  getCompanies(): Observable<Company[]> {
    return this.apiService.get<Company[]>('/public/companies');
  }

  getProfessionals(companyId: string): Observable<ProfessionalUser[]> {
    return this.apiService.get<ProfessionalUser[]>(`/public/companies/${companyId}/professionals`);
  }

  getServices(professionalId: string): Observable<Service[]> {
    return this.apiService.get<Service[]>(`/public/professionals/${professionalId}/services`);
  }

  getAvailableTimes(
    professionalId: string,
    date: string,
    durationMinutes: number,
    excludeAppointmentId?: string | null
  ): Observable<AvailableTimesResponse> {
    const params: Record<string, string> = {
      date,
      durationMinutes: String(durationMinutes)
    };
    if (excludeAppointmentId) {
      params['excludeAppointmentId'] = excludeAppointmentId;
    }
    return this.apiService.get<AvailableTimesResponse>(
      `/public/professionals/${professionalId}/available-times`,
      { params }
    );
  }

  createAppointment(professionalId: string, payload: any): Observable<Appointment> {
    return this.apiService.post<Appointment>(`/public/professionals/${professionalId}/appointments`, payload);
  }
}
