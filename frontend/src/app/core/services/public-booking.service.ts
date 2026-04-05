import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Company, ProfessionalUser, Service, DayScheduleConfig, Appointment } from '../models/salon.models';
import { Observable } from 'rxjs';

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

  getSchedule(professionalId: string): Observable<DayScheduleConfig[]> {
    return this.apiService.get<DayScheduleConfig[]>(`/public/professionals/${professionalId}/schedule`);
  }

  getScheduleOverrides(professionalId: string): Observable<DayScheduleConfig[]> {
    return this.apiService.get<DayScheduleConfig[]>(`/public/professionals/${professionalId}/schedule/overrides`);
  }

  getBusySlots(professionalId: string, date: string): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>(`/public/professionals/${professionalId}/appointments/busy?date=${date}`);
  }

  createAppointment(professionalId: string, payload: any): Observable<Appointment> {
    return this.apiService.post<Appointment>(`/public/professionals/${professionalId}/appointments`, payload);
  }
}
