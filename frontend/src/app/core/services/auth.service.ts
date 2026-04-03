import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SalonService } from '../../core/services/salon.service';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

export type UserRole = 'ROOT' | 'ADMIN' | 'CLIENT' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private localStorage = inject(LocalStorageRepository);
  private salonService = inject(SalonService);
  
  private currentUser = signal<{ role: UserRole, name: string, email: string } | null>(null);

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    if (typeof window !== 'undefined') {
      const tokenObj = this.localStorage.getRaw<{token: string}>('auth_token');
      if (tokenObj && tokenObj.token) {
        try {
          const decoded = jwtDecode<any>(tokenObj.token);
          if (decoded.exp && (decoded.exp * 1000 < Date.now())) {
            console.warn("Token JWT expirou.");
            this.logout();
            return;
          }
          
          const rawRole = decoded.roles && decoded.roles.length > 0 ? decoded.roles[0] : '';
          const finalRole = rawRole.replace('ROLE_', '');

          this.currentUser.set({
             role: finalRole as UserRole,
             name: decoded.sub || 'Usuário',
             email: decoded.sub
          });
        } catch(e) {
          console.error("Erro fatal ao extrair sessão do JWT:", e);
          this.logout();
        }
      }
    }
  }

  loginAdmin(email: string, password: string): Observable<{token: string}> {
    return this.httpClient.post<{token: string}>('http://localhost:8080/api/auth/login', { email, password }).pipe(
      tap(response => {
        if (response.token) {
          this.localStorage.saveRaw('auth_token', { token: response.token });
          this.checkSession();
        }
      })
    );
  }

  loginClient(email: string, otp: string) {
    const client = this.salonService.getClientByEmail(email);
    if (client?.isBlocked) {
      throw new Error('Sua conta está bloqueada. Entre em contato com o salão.');
    }

    if (otp === '123456') {
      const user = { role: 'CLIENT' as UserRole, name: client?.name || 'Cliente', email: email };
      this.currentUser.set(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return true;
    }
    return false;
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

