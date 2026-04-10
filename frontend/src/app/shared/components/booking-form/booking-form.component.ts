import { Component, inject, signal, output, computed, effect, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicBookingService } from '../../../core/services/public-booking.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClientPortalService } from '../../../core/services/client-portal.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { Service, Appointment, AppointmentStatus, Company, ProfessionalUser, Client } from '../../../core/models/salon.models';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DurationFormatPipe } from '../../pipes/duration-format.pipe';
import { toSignal, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EmailMaskDirective } from '../../directives/email-mask.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, DurationFormatPipe, EmailMaskDirective],
  templateUrl: './booking-form.html'
})
export class BookingFormComponent implements OnInit {
  private publicBookingService = inject(PublicBookingService);
  private fb = inject(FormBuilder);

  private appointmentService = inject(AppointmentService);
  private clientPortalService = inject(ClientPortalService);
  private authService = inject(AuthService);
  private clientDirectoryService = inject(ClientService);

  private pendingLandingAdminProfessionalId: string | null = null;

  finished = output<void>();
  preSelectedClientId = input<string>();
  selectedClient = input<Client | undefined>();
  editAppointment = input<Appointment | undefined>();
  editAppointmentId = computed(() => this.editAppointment()?.id ?? null);
  prefillDate = input<string>();
  prefillTime = input<string>();
  mode = input<'landing' | 'client' | 'admin'>('landing');
  preloadedCompanies = input<Company[] | undefined>(undefined);

  companies = signal<Company[]>([]);
  professionals = signal<ProfessionalUser[]>([]);

  selectedCompanyId = signal<string>('');
  selectedProfessionalId = signal<string>('');

  services = signal<Service[]>([]);

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

  availableTimes = signal<string[]>([]);

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

    combineLatest({
      professionalId: toObservable(this.selectedProfessionalId),
      date: toObservable(this.selectedDateStr),
      duration: toObservable(this.totalDuration),
      excludeId: toObservable(this.editAppointmentId)
    })
      .pipe(
        switchMap(({ professionalId, date, duration, excludeId }) => {
          if (
            !professionalId ||
            !date ||
            !/^\d{4}-\d{2}-\d{2}$/.test(String(date)) ||
            duration <= 0
          ) {
            return of([] as string[]);
          }
          return this.publicBookingService
            .getAvailableTimes(professionalId, String(date), duration, excludeId ?? undefined)
            .pipe(
              map((r) => r.slots),
              catchError(() => of([] as string[]))
            );
        }),
        takeUntilDestroyed()
      )
      .subscribe((slots) => this.availableTimes.set(slots));

    effect(() => {
      const id = this.selectedCompanyId();
      if (id) {
        this.publicBookingService.getProfessionals(id).subscribe((p) => {
          this.professionals.set(p);
          const pending = this.pendingLandingAdminProfessionalId;
          if (pending !== null && p.some((x) => x.id === pending)) {
            this.selectedProfessionalId.set(pending);
            this.pendingLandingAdminProfessionalId = null;
          }
        });
      } else {
        this.professionals.set([]);
      }
    });

    effect(() => {
      const id = this.selectedProfessionalId();
      if (id) {
        this.publicBookingService.getServices(id).subscribe(s => this.services.set(s.filter(x => x.isActive)));
      } else {
        this.services.set([]);
      }
    });

    effect(() => {
      const app = this.editAppointment();
      if (app) {
        this.selectedServicesArray.clear();
        app.serviceIds.forEach(id => this.selectedServicesArray.push(this.fb.control(id)));

        this.bookingForm.patchValue({
          client: {
            name: app.clientName || '',
            email: app.clientEmail || '',
            phone: app.clientPhone || ''
          },
          date: app.date,
          time: app.startTime
        }, { emitEvent: true });

        if (this.mode() !== 'admin') {
          if (app.companyId) this.selectedCompanyId.set(app.companyId);
          if (app.adminId) this.selectedProfessionalId.set(app.adminId);
        }
      }
    });

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
    const applyAdminLandingPrefill = () => {
      if (this.mode() !== 'landing' || !this.authService.isAdmin()) return;
      const u = this.authService.getUser()();
      if (!u?.id || !u.companyId) return;
      this.pendingLandingAdminProfessionalId = u.id;
      this.selectedCompanyId.set(u.companyId);
    };

    if (this.mode() === 'landing' || this.mode() === 'client') {
      const pre = this.preloadedCompanies();
      if (pre !== undefined) {
        this.companies.set(pre);
        applyAdminLandingPrefill();
      } else {
        this.publicBookingService.getCompanies().subscribe((list) => {
          this.companies.set(list);
          applyAdminLandingPrefill();
        });
      }
    }

    if (this.mode() === 'admin') {
      const me = this.authService.getUser()();
      if (me && me.id) {
        this.selectedProfessionalId.set(me.id);
      }
    }

    if (this.authService.isClient() && (this.mode() === 'landing' || this.mode() === 'client')) {
      const jwtUser = this.authService.getUser()();
      if (jwtUser) {
        this.bookingForm.patchValue({
          client: {
            name: jwtUser.name || '',
            email: jwtUser.email || '',
            phone: jwtUser.phone || ''
          }
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
    this.pendingLandingAdminProfessionalId = null;
    this.selectedCompanyId.set(id);
    this.selectedProfessionalId.set('');
  }

  onProfessionalSelect(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedProfessionalId.set(id);
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
        if (this.mode() === 'client') {
          this.clientPortalService
            .rescheduleAppointment(this.editAppointment()!.id, {
              serviceIds: val.selectedServices as string[],
              date: val.date as string,
              startTime: val.time as string
            })
            .subscribe({
              next: () => {
                alert('Agendamento reagendado com sucesso!');
                this.finished.emit();
                this.bookingForm.reset();
              },
              error: (err: HttpErrorResponse) => {
                const body = err.error;
                const detail =
                  typeof body === 'object' && body !== null && 'message' in body
                    ? String((body as { message: string }).message)
                    : err.message;
                alert('Erro ao reagendar: ' + detail);
              }
            });
        } else {
          alert('Edição não disponível neste fluxo.');
        }
      } else {
        this.publicBookingService.createAppointment(this.selectedProfessionalId(), payload).subscribe({
          next: () => {
            alert('Agendamento realizado com sucesso!');
            if (val.client.name) {
              this.authService.updateUserName(val.client.name);
            }
            this.finished.emit();
            this.bookingForm.reset();
          },
          error: (err: HttpErrorResponse) => {
            alert("Erro ao realizar agendamento: " + err.message);
          }
        });
      }
    } else {
      const editApp = this.editAppointment();
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
        const appointmentPayload = (clientId: string) => ({
          clientId,
          serviceIds: val.selectedServices as string[],
          date: val.date as string,
          startTime: val.time as string,
          status: AppointmentStatus.CONFIRMED
        });

        const submitAppointment = (clientId: string) => {
          this.appointmentService.create(appointmentPayload(clientId) as Appointment).subscribe({
            next: () => {
              alert('Agendamento criado com sucesso!');
              this.finished.emit();
            },
            error: (err) => alert('Erro ao criar agendamento: ' + err.message)
          });
        };

        const selected = this.selectedClient();
        if (selected) {
          submitAppointment(selected.id);
        } else {
          const c = val.client;
          this.clientDirectoryService
            .ensureClient({
              name: c.name ?? '',
              email: c.email ?? '',
              phone: c.phone ?? ''
            })
            .subscribe({
              next: (created) => submitAppointment(created.id),
              error: (err: HttpErrorResponse) => {
                const body = err.error;
                const detail =
                  typeof body === 'object' && body !== null && 'message' in body
                    ? String((body as { message: string }).message)
                    : err.message;
                alert('Não foi possível salvar o cliente: ' + detail);
              }
            });
        }
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
