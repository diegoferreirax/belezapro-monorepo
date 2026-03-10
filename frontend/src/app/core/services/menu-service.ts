import { Injectable, signal } from '@angular/core';
import { NavigationItem } from 'core/layout/navegation/navegation.type';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly menuSubject = new Subject<void>();
  readonly toggleObservable = this.menuSubject.asObservable();

  readonly isMobile = signal(false);
  readonly menuOpened = signal(true);

  readonly navegations: NavigationItem[] = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      route: '/',
      children: []
    },
    {
      name: 'Clients',
      icon: 'people',
      route: '/clients',
      children: []
    },
    {
      name: 'Settings',
      icon: 'settings',
      route: '/settings',
      children: [
        { name: 'Profile', icon: 'person', route: '/settings/profile', children: [] },
        { name: 'Preferences', icon: 'tune', route: '/settings/preferences', children: [] }
      ]
    },
    {
      name: 'About',
      icon: 'info',
      route: '/about',
      children: []
    }
  ];

  toggleMenu() {
    this.menuSubject.next();
  }

  toggleMobileMenu() {
    if (this.isMobile()) {
      this.menuSubject.next();
    }
  }
}
