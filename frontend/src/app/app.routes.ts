import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

import { rootGuard } from './core/guards/root.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/auth-selection/auth-selection.component').then(m => m.AuthSelectionComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'booking',
    loadComponent: () => import('./features/public/landing/booking-page.component').then(m => m.BookingPageComponent)
  },
  {
    path: 'entrar',
    loadComponent: () => import('./features/client/login/otp-login.component').then(m => m.OtpLoginComponent)
  },
  {
    path: 'client',
    canActivate: [clientGuard],
    loadComponent: () => import('./features/client/layout/client-layout.component').then(m => m.ClientLayoutComponent),
    children: [
      { path: '', redirectTo: 'appointments', pathMatch: 'full' },
      {
        path: 'appointments',
        loadComponent: () => import('./features/client/appointments/client-appointments.component').then(m => m.ClientAppointmentsComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'appointments', pathMatch: 'full' },
      {
        path: 'users',
        canActivate: [rootGuard],
        loadComponent: () => import('./features/admin/root-users/root-users.component').then(m => m.RootUsersComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/admin/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/admin/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./features/admin/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/admin/expenses/expenses.component').then(m => m.ExpensesComponent)
      }
    ]
  }
];
