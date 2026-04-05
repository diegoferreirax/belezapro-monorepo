import { Component, inject, signal, output, computed, effect, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicBookingService } from '../../../core/services/public-booking.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClientPortalService } from '../../../core/services/client-portal.service';
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleCalculatorService } from '../../../core/services/schedule-calculator.service';
import { Service, Appointment, AppointmentStatus, DayScheduleConfig, Company, ProfessionalUser, Client } from '../../../core/models/salon.models';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DurationFormatPipe } from '../../pipes/duration-format.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmailMaskDirective } from '../../directives/email-mask.directive';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, DurationFormatPipe, EmailMaskDirective],
  templateUrl: './booking-form.html'
})
export class BookingFormComponent implements OnInit {
  private publicBookingService = inject(PublicBookingService);
  private scheduleCalculator = inject(ScheduleCalculatorService);
  private fb = inject(FormBuilder);

  // Opcional para quando for usado na visão do admin para si mesmo
  private appointmentService = inject(AppointmentService);
  private clientPortalService = inject(ClientPortalService, { optional: true });
  private authService = inject(AuthService);

  finished = output<void>();
  preSelectedClientId = input<string>();
  selectedClient = input<Client | undefined>();
  editAppointment = input<Appointment | undefined>();
  prefillDate = input<string>();
  prefillTime = input<string>();
  mode = input<'landing' | 'client' | 'admin'>('landing');

  // Hierarchy
  companies = signal<Company[]>([]);
  professionals = signal<ProfessionalUser[]>([]);

  selectedCompanyId = signal<string>('');
  selectedProfessionalId = signal<string>('');

  services = signal<Service[]>([]);
  scheduleConfigs = signal<DayScheduleConfig[]>([]);
  scheduleOverrides = signal<DayScheduleConfig[]>([]);
  busySlots = signal<Appointment[]>([]);

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

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return [];
    }

    // Convert to Date to get weekDay
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();

    // First check if there is a specific override for this date
    let config = this.scheduleOverrides().find(c => c.date === date);

    // If no override, fallback to the standard day config
    if (!config) {
      config = this.scheduleConfigs().find(c => c.dayOfWeek === dayOfWeek);
    }

    return this.scheduleCalculator.getAvailableTimes(
      date,
      duration,
      this.busySlots(),
      config,
      this.editAppointment()?.id
    );
  });

  isAdmin = computed(() => this.mode() === 'admin');
  isGuest = computed(() => this.mode() === 'landing');

  clientSectionTitle = computed(() => {
    if (this.isAdmin()) return 'Dados do Cliente';
    if (this.isGuest()) return 'Seus Dados';
    return 'Confirme seus Dados';
  });

  selectedDateStr = toSignal(this.bookingForm.get('date')!.valueChanges, { initialValue: this.bookingForm.get('date')?.value ?? null });

  constructor() {
    effect(() => {
      const times = this.availableTimes();
      const currentTime = this.bookingForm.get('time')?.value;
      if (currentTime && !times.includes(currentTime)) {
        this.bookingForm.get('time')?.setValue('', { emitEvent: false });
      }
    });

    // Auto fetch busy slots based on selected date and profId (isolated from other form fields)
    effect(() => {
      const date = this.selectedDateStr();
      const profId = this.selectedProfessionalId();
      if (date && profId && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        this.publicBookingService.getBusySlots(profId, date).subscribe(slots => {
          this.busySlots.set(slots);
        });
      }
    });

    // Auto-populate when editAppointment is provided
    effect(() => {
      const app = this.editAppointment();
      if (app) {
        // Prepare FormArray for services
        this.selectedServicesArray.clear();
        app.serviceIds.forEach(id => this.selectedServicesArray.push(this.fb.control(id)));

        // Patch other values
        this.bookingForm.patchValue({
          client: {
            name: app.clientName || '',
            email: app.clientEmail || '',
            phone: app.clientPhone || ''
          },
          date: app.date,
          time: app.startTime
        }, { emitEvent: true });

        // Ensure professional context is set if not in admin mode (where it's already set)
        if (this.mode() !== 'admin' && app.adminId) {
          this.selectedProfessionalId.set(app.adminId);
        }
      }
    });

    // Auto-populate when selectedClient is provided (for new appointments)
    effect(() => {
      const client = this.selectedClient();
      if (client && !this.editAppointment()) {
        this.bookingForm.patchValue({
          client: {
            name: client.name,
            email: client.email,
            phone: client.phone
          }
        }, { emitEvent: true });
      }
    });
  }

  ngOnInit() {
    if (this.mode() === 'landing' || this.mode() === 'client') {
      this.publicBookingService.getCompanies().subscribe(list => this.companies.set(list));
    }

    if (this.mode() === 'admin') {
      const me = this.authService.getUser()();
      if (me && me.id) {
        this.selectedProfessionalId.set(me.id);
        this.publicBookingService.getServices(me.id).subscribe(s => this.services.set(s.filter(x => x.isActive)));
        this.publicBookingService.getSchedule(me.id).subscribe(s => this.scheduleConfigs.set(s));
        this.publicBookingService.getScheduleOverrides(me.id).subscribe(s => this.scheduleOverrides.set(s));
      }
    }

    if (this.mode() === 'client') {
      const me = this.authService.getUser()();
      if (me) {
        this.bookingForm.patchValue({
          client: {
            name: me.name || '',
            email: me.email || ''
          }
        });
      }
      if (this.clientPortalService) {
        this.clientPortalService.getMe().subscribe({
          next: (user: any) => {
            this.bookingForm.patchValue({
              client: {
                name: user.name || me?.name || '',
                email: user.email || me?.email || '',
                phone: user.phone || ''
              }
            });
          },
          error: () => { }
        });
      }
    }

    const pDate = this.prefillDate();
    if (pDate) this.bookingForm.patchValue({ date: pDate });

    const pTime = this.prefillTime();
    if (pTime) this.bookingForm.patchValue({ time: pTime });
  }

  onCompanySelect(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedCompanyId.set(id);
    this.selectedProfessionalId.set('');
    this.services.set([]);
    if (id) {
      this.publicBookingService.getProfessionals(id).subscribe(p => this.professionals.set(p));
    } else {
      this.professionals.set([]);
    }
  }

  onProfessionalSelect(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedProfessionalId.set(id);
    if (id) {
      this.publicBookingService.getServices(id).subscribe(s => this.services.set(s.filter(x => x.isActive)));
      this.publicBookingService.getSchedule(id).subscribe(s => this.scheduleConfigs.set(s));
      this.publicBookingService.getScheduleOverrides(id).subscribe(s => this.scheduleOverrides.set(s));
    } else {
      this.services.set([]);
      this.scheduleConfigs.set([]);
      this.scheduleOverrides.set([]);
    }
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
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

    if (this.mode() === 'landing' || this.mode() === 'client') {
      if (!this.selectedProfessionalId()) {
        alert("Selecione um profissional primeiro");
        return;
      }
      const payload = {
        client: val.client,
        selectedServices: val.selectedServices,
        date: val.date,
        time: val.time
      };

      if (this.editAppointment()) {
        const id = this.editAppointment()!.id;
        // Optimization: if we have the editAppointment object, we might use a different endpoint or same
        // For public mode, usually we only create. If we are editing, we probably need admin context.
        // But if the user is in 'client' mode, they might be rescheduling.
        alert("Edição no portal do cliente em desenvolvimento no backend");
      } else {
        this.publicBookingService.createAppointment(this.selectedProfessionalId(), payload).subscribe({
          next: () => {
            alert('Agendamento realizado com sucesso!');
            this.finished.emit();
            this.bookingForm.reset();
          },
          error: (err: HttpErrorResponse) => {
            alert("Erro ao realizar agendamento: " + err.message);
          }
        });
      }
    } else {
      // Admin Mode
      const editApp = this.editAppointment();
      console.log(editApp);
      if (editApp) {
        const appointmentData: Appointment = {
          ...editApp,
          serviceIds: val.selectedServices as string[],
          date: val.date as string,
          startTime: val.time as string
        };

        this.appointmentService.update(editApp.id, appointmentData).subscribe({
          next: () => {
            alert('Agendamento atualizado com sucesso!');
            this.finished.emit();
          },
          error: () => alert('Erro ao atualizar agendamento.')
        });
      } else {
        const client = this.selectedClient();
        if (!client) {
          alert("Selecione um cliente para realizar o agendamento.");
          return;
        }

        const appointmentData: any = {
          clientId: client.id,
          serviceIds: val.selectedServices as string[],
          date: val.date as string,
          startTime: val.time as string,
          status: AppointmentStatus.CONFIRMED // Agendamentos feitos pelo admin já nascem confirmados
        };

        this.appointmentService.create(appointmentData).subscribe({
          next: () => {
            alert('Agendamento criado com sucesso!');
            this.finished.emit();
          },
          error: (err) => alert('Erro ao criar agendamento: ' + err.message)
        });
      }
    }
  }

  getWhatsAppUrl() {
    const date = this.bookingForm.get('date')?.value;
    const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const message = `Olá, não encontrei um horário disponível no site${formattedDate ? ' para o dia ' + formattedDate : ''} e gostaria de verificar outras opções.`;
    return `https://wa.me/55445555555?text=${encodeURIComponent(message)}`;
  }
}
