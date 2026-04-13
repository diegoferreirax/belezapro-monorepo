import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly open = signal(false);

  readonly menuOpen = this.open.asReadonly();

  openMenu(): void {
    this.open.set(true);
  }

  closeMenu(): void {
    this.open.set(false);
  }

  toggleMenu(): void {
    this.open.update((v) => !v);
  }
}

