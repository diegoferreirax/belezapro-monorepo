import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'core/services/auth.service';
import { MenuService } from 'core/services/menu-service';
import { MaterialModule } from 'modules/material.module';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterLink],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  protected readonly menuService = inject(MenuService);
    private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly username: string = 'User';
  protected isLightTheme: boolean = false;

  protected logout(): void {
    this.router.navigate(['/login']);
    this.authService.logout();
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-mode', this.isLightTheme);
  }
}
