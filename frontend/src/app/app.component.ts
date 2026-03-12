import { Component, inject } from '@angular/core';
import { LayoutComponent } from 'core/layout/layout.component';
import { AuthService } from 'core/services/auth.service';
import { LoginComponent } from './features/login/login.component';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LayoutComponent, LoginComponent, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly authService = inject(AuthService);

  constructor(
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'nail-polish',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/nail-polish.svg')
    );
  }
}
