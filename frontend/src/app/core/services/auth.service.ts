import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

export type UserRole = 'ROOT' | 'ADMIN' | 'CLIENT' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private localStorage = inject(LocalStorageRepository);

  private currentUser = signal<{ id?: string, role: UserRole, name: string, email: string } | null>(null);

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    if (typeof window !== 'undefined') {
      const tokenObj = this.localStorage.getRaw<{ token: string }>('auth_token');
      if (tokenObj && tokenObj.token) {
        try {
          const decoded = jwtDecode<any>(tokenObj.token);
          if (decoded.exp && (decoded.exp * 1000 < Date.now())) {
            console.warn("Token JWT expirou.");
            this.logout();
            return;
          }

          const rawRole = decoded.roles && decoded.roles.length > 0 ? decoded.roles[0] : '';

          this.currentUser.set({
            id: decoded.userId,
            role: rawRole as UserRole,
            name: decoded.name || decoded.sub || 'Usuário',
            email: decoded.sub
          });
        } catch (e) {
          console.error("Erro fatal ao extrair sessão do JWT:", e);
          this.logout();
        }
      }
    }
  }

  loginAdmin(email: string, password: string): Observable<{ token: string }> {
    return this.apiService.post<{ token: string }>('/auth/login', { email, password }).pipe(
      tap(response => {
        if (response.token) {
          this.localStorage.saveRaw('auth_token', { token: response.token });
          this.checkSession();
        }
      })
    );
  }

  requestClientOtp(email: string): Observable<void> {
    return this.apiService.post<void>('/auth/otp/request', { email });
  }

  validateClientOtp(email: string, otp: string): Observable<{ token: string }> {
    return this.apiService.post<{ token: string }>('/auth/otp/validate', { email, password: otp }).pipe(
      tap(response => {
        if (response.token) {
          this.localStorage.saveRaw('auth_token', { token: response.token });
          this.checkSession();
        }
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.localStorage.saveRaw('auth_token', null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  updateUserName(name: string) {
    const user = this.currentUser();
    if (user) {
      this.currentUser.set({ ...user, name });
    }
  }

  getUser() {
    return this.currentUser.asReadonly();
  }

  isRoot() {
    return this.currentUser()?.role === 'ROOT';
  }

  isAdmin() {
    return this.currentUser()?.role === 'ADMIN' || this.isRoot();
  }

  isClient() {
    return this.currentUser()?.role === 'CLIENT';
  }
}

