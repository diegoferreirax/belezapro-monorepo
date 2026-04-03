import { Component, inject, signal, output, computed, effect, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/services/salon.service';
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleCalculatorService } from '../../../core/services/schedule-calculator.service';
import { Service, Appointment, AppointmentStatus, DayScheduleConfig } from '../../../core/models/salon.models';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DurationFormatPipe } from '../../pipes/duration-format.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmailMaskDirective } from '../../directives/email-mask.directive';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, DurationFormatPipe, EmailMaskDirective],
  templateUrl: './booking-form.html'
})
export class BookingFormComponent implements OnInit {
  private salonService = inject(SalonService);
  private scheduleCalculator = inject(ScheduleCalculatorService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  finished = output<void>();
  preSelectedClientId = input<string>();
  editAppointmentId = input<string>();
  prefillDate = input<string>();
  prefillTime = input<string>();
  mode = input<'landing' | 'client' | 'admin'>('landing');

  services = signal<Service[]>([]);
  appointments = signal<Appointment[]>([]);
  scheduleConfigs = signal<DayScheduleConfig[]>([]);
  
  bookingForm = this.fb.group({
    client: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    selectedServices: this.fb.array([], Validators.required),
    date: [new Date().toLocaleDateString('en-CA'), Validators.required],
    time: ['', Validators.required]
  });

  // Create a signal from form value changes for reactivity
  formValue = toSignal(this.bookingForm.valueChanges, { initialValue: this.bookingForm.value });

  totalDuration = computed(() => {
    const selectedIds = this.formValue()?.selectedServices as string[] || [];
    return selectedIds.reduce((acc: number, id: string) => {
      const s = this.services().find((srv: Service) => srv.id === id);
      return acc + (s?.durationMinutes || 0);
    }, 0);
  });

  today = signal(new Date().toLocaleDateString('en-CA'));

  totalPrice = computed(() => {
    const selectedIds = this.formValue()?.selectedServices as string[] || [];
    return selectedIds.reduce((acc: number, id: string) => {
      const s = this.services().find((srv: Service) => srv.id === id);
      return acc + (s?.price || 0);
    }, 0);
  });

  availableTimes = computed(() => {
    const date = this.formValue()?.date;
    const duration = this.totalDuration();
    
    // Basic validation for date format YYYY-MM-DD
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return [];
    }
    
    return this.scheduleCalculator.getAvailableTimes(
      date,
      duration,
      this.appointments(),
      this.editAppointmentId()
    );
  });

  isAdmin = computed(() => this.mode() === 'admin');
  isGuest = computed(() => this.mode() === 'landing');

  clientSectionTitle = computed(() => {
    if (this.isAdmin()) return 'Dados do Cliente';
    if (this.isGuest()) return 'Seus Dados';
    return 'Confirme seus Dados';
  });

  constructor() {
    this.services.set(this.salonService.getServices().filter(s => s.isActive));
    this.appointments.set(this.salonService.getAppointments());
    this.scheduleConfigs.set(this.salonService.getScheduleConfigs());

    effect(() => {
      const times = this.availableTimes();
      const currentTime = this.bookingForm.get('time')?.value;
      if (currentTime && !times.includes(currentTime)) {
        this.bookingForm.get('time')?.setValue('', { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    const editId = this.editAppointmentId();
    if (editId) {
      const appointment = this.salonService.getAppointments().find(a => a.id === editId);
      if (appointment) {
        const client = this.salonService.clients().find(c => c.id === appointment.clientId);
        if (client) {
          this.bookingForm.patchValue({
            client: {
              name: client.name,
              email: client.email,
              phone: client.phone
            },
            date: appointment.date,
            time: appointment.startTime
          });
          this.bookingForm.get('client')?.disable();
        }
        
        // Populate services
        appointment.serviceIds.forEach(serviceId => {
          this.selectedServicesArray.push(this.fb.control(serviceId));
        });
        
        // Ensure the time is set correctly after services are populated
        this.bookingForm.patchValue({ time: appointment.startTime });
      }
    } else {
      const preSelectedId = this.preSelectedClientId();
      if (preSelectedId) {
        const client = this.salonService.clients().find(c => c.id === preSelectedId);
        if (client) {
          this.bookingForm.patchValue({
            client: {
              name: client.name,
              email: client.email,
              phone: client.phone
            }
          });
          this.bookingForm.get('client')?.disable();
        }
      } else {
        const user = this.authService.getUser()();
        if (user && user.role === 'client' && user.email) {
          const client = this.salonService.getClientByEmail(user.email);
          if (client) {
            this.bookingForm.patchValue({
              client: {
                name: client.name,
                email: client.email,
                phone: client.phone
              }
            });
            this.bookingForm.get('client')?.disable();
          } else {
            this.bookingForm.patchValue({
              client: {
                email: user.email
              }
            });
            this.bookingForm.get('client.email')?.disable();
          }
        }
      }
      
      const pDate = this.prefillDate();
      if (pDate) {
        this.bookingForm.patchValue({ date: pDate });
      }
      const pTime = this.prefillTime();
      if (pTime) {
        this.bookingForm.patchValue({ time: pTime });
      }
    }
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Manual input can sometimes delay valueChanges emission in some browsers for type="date"
    // Forcing the value update ensures the signal triggers immediately
    if (input.value && /^\d{4}-\d{2}-\d{2}$/.test(input.value)) {
      this.bookingForm.get('date')?.setValue(input.value, { emitEvent: true });
    }
  }

  get selectedServicesArray() {
    return this.bookingForm.get('selectedServices') as FormArray;
  }

  toggleService(serviceId: string) {
    const index = this.selectedServicesArray.controls.findIndex(c => c.value === serviceId);
    if (index !== -1) {
      this.selectedServicesArray.removeAt(index);
    } else {
      this.selectedServicesArray.push(this.fb.control(serviceId));
    }
  }

  isServiceSelected(id: string) {
    return this.selectedServicesArray.value.includes(id);
  }

  isEmailInvalid(): boolean {
    const control = this.bookingForm.get('client.email');
    return !!(control && control.invalid && control.touched);
  }

  getEmailErrorMessage(): string {
    const control = this.bookingForm.get('client.email');
    if (control?.hasError('required')) return 'O e-mail é obrigatório.';
    if (control?.hasError('email')) return 'Digite um e-mail válido.';
    return '';
  }

  submit() {
    if (this.bookingForm.invalid) return;

    const val = this.bookingForm.getRawValue();
    
    // 1. Handle Client
    let client = this.salonService.getClientByEmail(val.client.email!);
    
    if (client?.isBlocked) {
      alert('Não é possível realizar o agendamento. Por favor, entre em contato com o salão.');
      return;
    }

    if (!client) {
      client = {
        id: crypto.randomUUID(),
        name: val.client.name!,
        email: val.client.email!,
        phone: val.client.phone!
      };
      this.salonService.addClient(client);
      this.authService.updateUserName(client.name);
    }

    // 2. Create or Update Appointment
    const editId = this.editAppointmentId();
    if (editId) {
      const existingAppointment = this.salonService.getAppointments().find(a => a.id === editId);
      if (existingAppointment) {
        const updatedAppointment: Appointment = {
          ...existingAppointment,
          serviceIds: val.selectedServices as string[],
          date: val.date!,
          startTime: val.time!,
          totalDurationMinutes: this.totalDuration(),
          totalPrice: this.totalPrice()
        };
        this.salonService.updateAppointment(updatedAppointment);
        alert('Agendamento atualizado com sucesso!');
      }
    } else {
      const appointment: Appointment = {
        id: crypto.randomUUID(),
        clientId: client.id,
        serviceIds: val.selectedServices as string[],
        date: val.date!,
        startTime: val.time!,
        totalDurationMinutes: this.totalDuration(),
        totalPrice: this.totalPrice(),
        status: AppointmentStatus.PENDING
      };
      this.salonService.addAppointment(appointment);
      alert('Agendamento realizado com sucesso!');
    }

    this.appointments.set(this.salonService.getAppointments());
    this.finished.emit();
    this.bookingForm.reset();
  }

  getWhatsAppUrl() {
    const date = this.bookingForm.get('date')?.value;
    const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const message = `Olá, não encontrei um horário disponível no site${formattedDate ? ' para o dia ' + formattedDate : ''} e gostaria de verificar outras opções.`;
    return `https://wa.me/55445555555?text=${encodeURIComponent(message)}`;
  }
}
