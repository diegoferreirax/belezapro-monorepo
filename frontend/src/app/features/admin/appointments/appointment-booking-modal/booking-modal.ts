import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BookingFormComponent } from '../../../../shared/components/booking-form/booking-form.component';

@Component({
  selector: 'app-appointment-booking-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, BookingFormComponent],
  templateUrl: './booking-modal.html'
})
export class AppointmentBookingModalComponent {
  @Input() isOpen = false;
  @Input() editAppointmentId: string | undefined;
  @Input() prefillDate: string | undefined;
  @Input() prefillTime: string | undefined;
  @Output() closed = new EventEmitter<void>();
  @Output() finished = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  onFinished() {
    this.finished.emit();
  }
}
