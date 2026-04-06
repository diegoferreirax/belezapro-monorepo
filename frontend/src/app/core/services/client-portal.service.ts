import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Appointment, AppointmentStatus, Company } from '../models/salon.models';
import { PageRequest, PageResponse, SpringPage } from '../models/pagination.models';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientPortalService {
  private apiService = inject(ApiService);

  getCompaniesWithAppointments(): Observable<Company[]> {
    return this.apiService.get<Company[]>('/client-portal/appointments/companies');
  }

  getMe(): Observable<any> {
    return this.apiService.get<any>('/client-portal/appointments/me');
  }

  getPaginatedList(request: PageRequest, companyId?: string, term?: string, startDate?: string, endDate?: string, status?: AppointmentStatus): Observable<PageResponse<Appointment>> {
    let params = new HttpParams()
      .set('page', (request.page - 1).toString())
      .set('size', request.pageSize.toString());

    if (companyId) params = params.set('companyId', companyId);
    if (term) params = params.set('term', term);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (status) params = params.set('status', status);

    return this.apiService.get<SpringPage<Appointment>>('/client-portal/appointments', { params }).pipe(
      map(res => ({
        items: res.content || [],
        totalItems: res.totalElements || 0,
        totalPages: res.totalPages || 0,
        currentPage: (res.number || 0) + 1,
        pageSize: res.size || 10
      }))
    );
  }

  rescheduleAppointment(
    id: string,
    body: { serviceIds: string[]; date: string; startTime: string }
  ): Observable<Appointment> {
    return this.apiService.put<Appointment>(`/client-portal/appointments/${id}`, body);
  }

  cancelAppointment(id: string): Observable<Appointment> {
    return this.apiService.patch<Appointment>(`/client-portal/appointments/${id}/cancel`, {});
  }
}
