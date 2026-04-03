import { Injectable, signal, inject } from '@angular/core';
import { SalonService } from '../../core/services/salon.service';

export type UserRole = 'admin' | 'client' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private salonService = inject(SalonService);
  private currentUser = signal<{ role: UserRole, name: string, email: string } | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  private setStorage(key: string, value: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private removeStorage(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  loginAdmin(username: string, password: string) {
    // Simulating admin login
    if (username === 'maria' && password === 'admin123') {
      const user = { role: 'admin' as UserRole, name: 'Maria', email: 'maria@salon.com' };
      this.currentUser.set(user);
      this.setStorage('user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  loginClient(email: string, otp: string) {
    const client = this.salonService.getClientByEmail(email);
    if (client?.isBlocked) {
      throw new Error('Sua conta está bloqueada. Entre em contato com o salão.');
    }

    // Simulating OTP login
    if (otp === '123456') {
      const user = { role: 'client' as UserRole, name: client?.name || 'Cliente', email: email };
      this.currentUser.set(user);
      this.setStorage('user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    this.removeStorage('user');
  }

  updateUserName(name: string) {
    const user = this.currentUser();
    if (user) {
      const updatedUser = { ...user, name };
      this.currentUser.set(updatedUser);
      this.setStorage('user', JSON.stringify(updatedUser));
    }
  }

  getUser() {
    return this.currentUser.asReadonly();
  }

  isAdmin() {
    return this.currentUser()?.role === 'admin';
  }

  isClient() {
    const user = this.currentUser();
    if (user?.role === 'client') {
      const client = this.salonService.getClientByEmail(user.email);
      if (client?.isBlocked) {
        this.logout();
        return false;
      }
      return true;
    }
    return false;
  }
}
