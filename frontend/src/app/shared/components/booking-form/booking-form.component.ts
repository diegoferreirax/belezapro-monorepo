import { Component, inject, signal, output, computed, effect, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicBookingService } from '../../../core/services/public-booking.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ScheduleCalculatorService } from '../../../core/services/schedule-calculator.service';
import { Service, Appointment, AppointmentStatus, DayScheduleConfig, Company, ProfessionalUser } from '../../../core/models/salon.models';
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

  finished = output<void>();
  preSelectedClientId = input<string>();
  editAppointmentId = input<string>();
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
    const config = this.scheduleConfigs().find(c => c.dayOfWeek === dayOfWeek);

    return this.scheduleCalculator.getAvailableTimes(
      date,
      duration,
      this.busySlots(),
      config,
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
    effect(() => {
      const times = this.availableTimes();
      const currentTime = this.bookingForm.get('time')?.value;
      if (currentTime && !times.includes(currentTime)) {
        this.bookingForm.get('time')?.setValue('', { emitEvent: false });
      }
    });
    
    // Auto fetch busy slots based on selected date
    effect(() => {
      const date = this.formValue()?.date;
      const profId = this.selectedProfessionalId();
      if(date && profId && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
         this.publicBookingService.getBusySlots(profId, date).subscribe(slots => {
            this.busySlots.set(slots);
         });
      }
    });
  }

  ngOnInit() {
    if (this.mode() === 'landing' || this.mode() === 'client') {
      this.publicBookingService.getCompanies().subscribe(list => this.companies.set(list));
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
    if(id) {
       this.publicBookingService.getServices(id).subscribe(s => this.services.set(s.filter(x => x.isActive)));
       this.publicBookingService.getSchedule(id).subscribe(s => this.scheduleConfigs.set(s));
    } else {
       this.services.set([]);
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

    if(this.mode() === 'landing' || this.mode() === 'client') {
       if(!this.selectedProfessionalId()) {
          alert("Selecione um profissional primeiro");
          return;
       }
       const payload = {
          client: val.client,
          selectedServices: val.selectedServices,
          date: val.date,
          time: val.time
       };

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
    } else {
       alert("Funcionalidade Admin booking em desenvolvimento");
    }
  }

  getWhatsAppUrl() {
    const date = this.bookingForm.get('date')?.value;
    const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const message = `Olá, não encontrei um horário disponível no site${formattedDate ? ' para o dia ' + formattedDate : ''} e gostaria de verificar outras opções.`;
    return `https://wa.me/55445555555?text=${encodeURIComponent(message)}`;
  }
}
