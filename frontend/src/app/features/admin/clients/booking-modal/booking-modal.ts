import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BookingFormComponent } from '../../../../shared/components/booking-form/booking-form.component';
import { Client } from '../../../../core/models/salon.models';

@Component({
  selector: 'app-client-booking-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, BookingFormComponent],
  templateUrl: './booking-modal.html'
})
export class ClientBookingModalComponent {
  @Input() isOpen = false;
  @Input() client: Client | undefined;
  @Output() closed = new EventEmitter<void>();
  @Output() finished = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  onFinished() {
    this.finished.emit();
  }
}
