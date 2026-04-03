import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private httpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/users';

  getUsers(page: number = 1, size: number = 10, filters: {name?: string, email?: string, role?: string} = {}): Observable<PageResponse<SystemUser>> {
    const javaPage = page - 1;
    let url = `${this.apiUrl}?page=${javaPage}&size=${size}`;
    
    if (filters.name) url += `&name=${encodeURIComponent(filters.name)}`;
    if (filters.email) url += `&email=${encodeURIComponent(filters.email)}`;
    if (filters.role && filters.role !== 'ALL') url += `&role=${encodeURIComponent(filters.role)}`;
    
    return this.httpClient.get<any>(url).pipe(
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
    return this.httpClient.post<SystemUser>(this.apiUrl, data);
  }

  updateUser(id: string, data: any): Observable<SystemUser> {
    return this.httpClient.put<SystemUser>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleBlock(id: string): Observable<SystemUser> {
    return this.httpClient.patch<SystemUser>(`${this.apiUrl}/${id}/toggle-block`, {});
  }
}
