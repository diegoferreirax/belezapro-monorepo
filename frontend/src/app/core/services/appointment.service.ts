import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Appointment, AppointmentStatus } from '../models/salon.models';
import { PageRequest, PageResponse, SpringPage } from '../models/pagination.models';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiService = inject(ApiService);

  getPaginatedList(request: PageRequest, clientId?: string, term?: string, startDate?: string, endDate?: string, status?: AppointmentStatus): Observable<PageResponse<Appointment>> {
    let params = new HttpParams()
      .set('page', (request.page - 1).toString())
      .set('size', request.pageSize.toString());

    if (clientId) params = params.set('clientId', clientId);
    if (term) params = params.set('term', term);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (status) params = params.set('status', status);

    return this.apiService.get<SpringPage<Appointment>>('/appointments', { params }).pipe(
      map(res => ({
        items: res.content || [],
        totalItems: res.totalElements || 0,
        totalPages: res.totalPages || 0,
        currentPage: (res.number || 0) + 1,
        pageSize: res.size || 10
      }))
    );
  }

  getRangeForCalendar(startDate: string, endDate: string): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.apiService.get<Appointment[]>('/appointments/range', { params });
  }

  getActiveByDate(date: string): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>(`/appointments/active/date/${date}`);
  }

  create(appointment: Appointment): Observable<Appointment> {
    return this.apiService.post<Appointment>('/appointments', appointment);
  }

  update(id: string, appointment: Appointment): Observable<Appointment> {
    return this.apiService.put<Appointment>(`/appointments/${id}`, appointment);
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`/appointments/${id}`);
  }

  cancelAppointmentsByDate(date: string): Observable<void> {
    return this.apiService.patch<void>(`/appointments/cancel/date/${date}`, {});
  }
}
