import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Appointment, AppointmentStatus, AppointmentStatusLabels, Client, Service } from '../../../../core/models/salon.models';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, DurationFormatPipe],
  templateUrl: './appointment-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentListComponent {
  appointments = input.required<Appointment[]>();
  clients = input.required<Client[]>();

  editAppointment = output<Appointment>();
  cancelAppointment = output<string>();
  statusChange = output<{ appointment: Appointment, status: AppointmentStatus }>();

  AppointmentStatus = AppointmentStatus;
  StatusLabels = AppointmentStatusLabels;

  getClientName(appointment: Appointment): string {
    return appointment.clientName || 'Cliente desconhecido';
  }

  getServiceNames(appointment: Appointment): string {
    if (!appointment.parsedServiceNames || appointment.parsedServiceNames.length === 0) return '';
    return appointment.parsedServiceNames.join(', ');
  }
}
