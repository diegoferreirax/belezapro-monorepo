import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../../../../core/models/salon.models';

@Component({
  selector: 'app-appointment-cancel-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './cancel-modal.html'
})
export class AppointmentCancelModalComponent {
  @Input() appointment: Appointment | undefined;
  @Input() clientName = 'Cliente desconhecido';
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }
}
