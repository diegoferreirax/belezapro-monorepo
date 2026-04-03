import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingFormComponent } from '../../../shared/components/booking-form/booking-form.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, BookingFormComponent, MatIconModule],
  templateUrl: './booking-page.html'
})
export class BookingPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  navigateToClient() {
    const user = this.authService.getUser()();
    if (user && user.role === 'client') {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/entrar']);
    }
  }

  navigateToAdmin() {
    const user = this.authService.getUser()();
    if (user && user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
