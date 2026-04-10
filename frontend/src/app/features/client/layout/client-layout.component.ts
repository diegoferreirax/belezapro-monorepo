import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [NgClass, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './client-layout.html'
})
export class ClientLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected menu = inject(MenuService);

  logout() {
    this.menu.closeMenu();
    this.authService.logout();
    this.router.navigate(['/entrar']);
  }
}
