import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuService } from 'core/services/menu-service';
import { MaterialModule } from 'modules/material.module';

@Component({
  selector: 'app-toolbar',
  imports: [MaterialModule, CommonModule, RouterLink],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  protected readonly menuService = inject(MenuService);

  protected readonly username: string = 'User';
  protected isLightTheme: boolean = false;

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-mode', this.isLightTheme);
  }
}
