import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Appointment, AppointmentStatus, Client, Service } from '../../../../core/models/salon.models';
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
  services = input.required<Service[]>();

  editAppointment = output<Appointment>();
  cancelAppointment = output<string>();
  statusChange = output<{ appointment: Appointment, status: AppointmentStatus }>();

  AppointmentStatus = AppointmentStatus;

  getClientName(clientId: string): string {
    return this.clients().find(c => c.id === clientId)?.name || 'Cliente desconhecido';
  }

  getServiceNames(serviceIds: string[]): string {
    return serviceIds
      .map(id => this.services().find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }
}
