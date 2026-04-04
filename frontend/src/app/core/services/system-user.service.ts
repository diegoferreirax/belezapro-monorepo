import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map } from 'rxjs';
import { PageResponse } from '../models/pagination.models';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SystemUserService {
  private apiService = inject(ApiService);
  private basePath = '/users';

  getUsers(page: number = 1, size: number = 10, filters: {name?: string, email?: string, role?: string} = {}): Observable<PageResponse<SystemUser>> {
    const javaPage = page - 1;
    let url = `${this.basePath}?page=${javaPage}&size=${size}`;
    
    if (filters.name) url += `&name=${encodeURIComponent(filters.name)}`;
    if (filters.email) url += `&email=${encodeURIComponent(filters.email)}`;
    if (filters.role && filters.role !== 'ALL') url += `&role=${encodeURIComponent(filters.role)}`;
    
    return this.apiService.get<any>(url).pipe(
      map(res => ({
        items: res.content,
        totalItems: res.totalElements,
        totalPages: res.totalPages,
        currentPage: res.number + 1,
        pageSize: res.size
      }))
    );
  }

  createUser(data: any): Observable<SystemUser> {
    return this.apiService.post<SystemUser>(this.basePath, data);
  }

  updateUser(id: string, data: any): Observable<SystemUser> {
    return this.apiService.put<SystemUser>(`${this.basePath}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.basePath}/${id}`);
  }

  toggleBlock(id: string): Observable<SystemUser> {
    return this.apiService.patch<SystemUser>(`${this.basePath}/${id}/toggle-block`, {});
  }
}
