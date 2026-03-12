import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './common-pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((c) => c.DashboardComponent)
  },
  {
    path: 'clients',
    loadComponent: () => import('./features/client/client.component').then((c) => c.ClientComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then((c) => c.AboutComponent)
  },
  {
    path: 'settings/profile',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((c) => c.DashboardComponent)
  },
  {
    path: 'settings/preferences',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((c) => c.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((c) => c.LoginComponent)
  },
  { path: '**', component: PageNotFoundComponent }
];
