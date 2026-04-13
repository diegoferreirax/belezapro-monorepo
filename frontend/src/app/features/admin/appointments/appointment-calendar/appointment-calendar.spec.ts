import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentCalendarComponent } from './appointment-calendar';
import { Appointment, AppointmentStatus, DayScheduleConfig } from '../../../../core/models/salon.models';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AppointmentCalendarComponent', () => {
  let component: AppointmentCalendarComponent;
  let fixture: ComponentFixture<AppointmentCalendarComponent>;
  let mockScheduleService: { getConfigForDate: ReturnType<typeof vi.fn> };

  const mockDate = new Date('2026-03-22T10:00:00'); // Sunday (0)

  beforeEach(async () => {
    mockScheduleService = {
      getConfigForDate: vi.fn().mockReturnValue({
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '18:00',
        breaks: [],
        isClosed: false
      })
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: ScheduleService, useValue: mockScheduleService }
      ]
    }).compileComponents();

    TestBed.overrideComponent(AppointmentCalendarComponent, {
      set: {
        selector: 'app-appointment-calendar',
        imports: [CommonModule, MatIconModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
<div class="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm flex flex-col h-[800px]">
  
  <!-- Calendar Header (Controls) -->
  <div class="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
    <div class="flex items-center gap-2">
      <button (click)="previousWeek()" class="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <button (click)="today()" class="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
        Hoje
      </button>
      <button (click)="nextWeek()" class="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
    <div class="text-lg font-serif italic text-stone-800">
      {{ calendarDays()[0] | date:'MMMM yyyy' }}
    </div>
    <div class="w-[120px]"></div> <!-- Spacer for balance -->
  </div>

  <!-- Calendar Grid -->
  <div class="flex-1 overflow-y-auto flex">
    
    <!-- Time Axis (Y) -->
    <div class="w-16 shrink-0 border-r border-stone-100 bg-stone-50/30 relative">
      <div class="h-12 border-b border-stone-100"></div> <!-- Header spacer -->
      <div class="relative" [style.height.px]="calendarHeight()">
        @for (hour of calendarHours(); track hour) {
          <div class="absolute w-full text-right pr-2 text-xs text-stone-400 font-medium"
               [style.top.px]="(hour - calendarBounds().minHour) * 90 - 8">
            {{ formatHour(hour) }}
          </div>
        }
      </div>
    </div>

    <!-- Days Grid (X) -->
    <div class="flex-1 flex min-w-[800px]">
      @for (day of calendarDays(); track day.getTime()) {
        <div class="flex-1 border-r border-stone-100 last:border-r-0 flex flex-col">
          
          <!-- Day Header -->
          <div class="h-12 border-b border-stone-100 flex flex-col items-center justify-center bg-stone-50/50 sticky top-0 z-20">
            <span class="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{{ day | date:'EEE' }}</span>
            <span class="text-sm font-medium text-stone-800" [class.text-rose-600]="day.toDateString() === (currentDate() | date:'EEE MMM dd yyyy')">{{ day | date:'dd' }}</span>
          </div>

          <!-- Day Content (Relative Container) -->
          <div class="relative shrink-0" [style.height.px]="calendarHeight()">
            
            <!-- Hour Grid Lines -->
            @for (hour of calendarHours(); track hour) {
              <div class="absolute w-full border-t border-stone-100/50"
                   [style.top.px]="(hour - calendarBounds().minHour) * 90"></div>
            }

            <!-- Clickable Background for New Appointments -->
            <div class="absolute inset-0 z-0 flex flex-col">
              @for (slot of clickableSlots(); track $index) {
                <div class="h-[45px] hover:bg-stone-50/50 cursor-pointer transition-colors border-t border-transparent hover:border-stone-200/30"
                     role="button" tabindex="0"
                     (click)="bookAt.emit({ date: day, hour: slot.hour, minutes: slot.minutes })"
                     (keydown.enter)="bookAt.emit({ date: day, hour: slot.hour, minutes: slot.minutes })"></div>
              }
            </div>

            <!-- Unavailable Blocks -->
            @for (block of getUnavailableBlocksForDay(day); track $index) {
              <div class="absolute left-0 right-0 bg-stone-200/40 z-10"
                   style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px);"
                   [style.top.px]="block.top"
                   [style.height.px]="block.height"
                   role="presentation">
              </div>
            }

            <!-- Appointments -->
            @for (app of getAppointmentsForDay(day); track app.id) {
              <div [class]="getAppointmentClasses(app)"
                   [style.top.px]="calculateTop(app.startTime)"
                   [style.height.px]="calculateHeight(app.totalDurationMinutes)"
                   role="button" tabindex="0"
                   (click)="handleAppointmentClick(app, $event)"
                   (keydown.enter)="handleAppointmentClick(app, $event)">
                
                <div class="text-xs font-bold mb-0.5 truncate">{{ app.startTime }}</div>
                <div class="text-sm font-medium leading-tight truncate">{{ getClientName(app.clientId) }}</div>
                <div class="text-xs opacity-70 truncate mt-1">{{ getServiceNames(app.serviceIds) }}</div>
                
                <!-- Hover Actions Overlay -->
                @if (app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.CONFIRMED) {
                  <div class="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    @if (app.status === AppointmentStatus.PENDING) {
                      <button (click)="onStatusChangeClick(app, AppointmentStatus.CONFIRMED, $event)" title="Confirmar" class="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center">
                        <mat-icon class="text-[20px] w-[20px] h-[20px]">check_circle</mat-icon>
                      </button>
                    }
                    @if (app.status === AppointmentStatus.CONFIRMED) {
                      <button (click)="onStatusChangeClick(app, AppointmentStatus.COMPLETED, $event)" title="Concluir" class="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center">
                        <mat-icon class="text-[20px] w-[20px] h-[20px]">done_all</mat-icon>
                      </button>
                    }
                    <button (click)="handleAppointmentClick(app, $event)" title="Editar" class="p-1 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center">
                      <mat-icon class="text-[20px] w-[20px] h-[20px]">edit</mat-icon>
                    </button>
                    <button (click)="onCancelClick(app, $event)" title="Cancelar" class="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors flex items-center justify-center">
                      <mat-icon class="text-[20px] w-[20px] h-[20px]">cancel</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  </div>
</div>
`
      }
    });

    fixture = TestBed.createComponent(AppointmentCalendarComponent);
    component = fixture.componentInstance;
    
    // Set required inputs BEFORE detectChanges
    fixture.componentRef.setInput('appointments', []);
    fixture.componentRef.setInput('clients', []);
    fixture.componentRef.setInput('services', []);
    fixture.componentRef.setInput('currentDate', mockDate);
    
    // Manually trigger initial state if needed, but detectChanges should handle it
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Lógica de Dimensões e Posicionamento', () => {
    it('deve calcular o topo corretamente (calculateTop)', () => {
      // Se o calendário começa às 08:00 (padrão)
      // 08:00 -> 0px
      expect(component.calculateTop('08:00')).toBe(0);
      // 09:00 -> (60 min * 1.5) = 90px
      expect(component.calculateTop('09:00')).toBe(90);
      // 10:30 -> (150 min * 1.5) = 225px
      expect(component.calculateTop('10:30')).toBe(225);
    });

    it('deve calcular a altura corretamente (calculateHeight)', () => {
      // 60 min -> 90px
      expect(component.calculateHeight(60)).toBe(90);
      // 30 min -> 45px
      expect(component.calculateHeight(30)).toBe(45);
      // 180 min (3h) -> 270px
      expect(component.calculateHeight(180)).toBe(270);
    });
  });

  describe('Limites Dinâmicos do Calendário (calendarBounds)', () => {
    it('deve respeitar a configuração de horário do salão', () => {
      const config: DayScheduleConfig = {
        dayOfWeek: 0,
        startTime: '07:00',
        endTime: '22:00',
        breaks: [],
        isClosed: false
      };
      mockScheduleService.getConfigForDate.mockReturnValue(config);
      
      // Force re-evaluation of computed signal
      fixture.componentRef.setInput('currentDate', new Date('2026-03-23T10:00:00'));
      fixture.detectChanges();
      const bounds = component.calendarBounds();
      expect(bounds.minHour).toBe(7);
      expect(bounds.maxHour).toBe(22);
    });

    it('deve expandir se houver agendamento fora do horário comercial', () => {
      fixture.componentRef.setInput('appointments', [{
        id: '1',
        clientId: 'c1',
        serviceIds: ['s1'],
        date: '2026-03-22',
        startTime: '06:00',
        totalDurationMinutes: 60,
        totalPrice: 100,
        status: AppointmentStatus.CONFIRMED
      }]);
      
      fixture.detectChanges();
      const bounds = component.calendarBounds();
      expect(bounds.minHour).toBe(6);
    });
  });

  describe('Blocos de Indisponibilidade (getUnavailableBlocksForDay)', () => {
    it('deve bloquear o dia inteiro se o salão estiver fechado', () => {
      mockScheduleService.getConfigForDate.mockReturnValue({
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '18:00',
        breaks: [],
        isClosed: true
      });
      fixture.componentRef.setInput('currentDate', new Date('2026-03-23T10:00:00'));
      fixture.detectChanges();

      const blocks = component.getUnavailableBlocksForDay(mockDate);
      expect(blocks.length).toBe(1);
      expect(blocks[0].height).toBe(component.calendarHeight());
    });

    it('deve gerar múltiplos blocos para múltiplos intervalos de pausa (breaks)', () => {
      mockScheduleService.getConfigForDate.mockReturnValue({
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '20:00',
        breaks: [
          { start: '12:00', end: '13:00' },
          { start: '15:00', end: '16:00' }
        ],
        isClosed: false
      });

      fixture.componentRef.setInput('currentDate', new Date('2026-03-23T10:00:00'));
      fixture.detectChanges();
      const blocks = component.getUnavailableBlocksForDay(mockDate);
      
      // Filtramos apenas os blocos que correspondem aos breaks
      // (Pode haver blocos de margem se o calendário for maior que o horário de abertura)
      const calStartMin = component.calendarBounds().minHour * 60;
      
      // Break 1: 12:00-13:00 -> top: (720-480)*1.5 = 360, height: 60*1.5 = 90
      const break1 = blocks.find(b => b.top === (12 * 60 - calStartMin) * 1.5);
      expect(break1).toBeDefined();
      expect(break1?.height).toBe(90);

      // Break 2: 15:00-16:00 -> top: (900-480)*1.5 = 630, height: 60*1.5 = 90
      const break2 = blocks.find(b => b.top === (15 * 60 - calStartMin) * 1.5);
      expect(break2).toBeDefined();
      expect(break2?.height).toBe(90);
    });

    it('deve gerar blocos de margem se o salão abrir mais tarde que o início do calendário', () => {
      mockScheduleService.getConfigForDate.mockReturnValue({
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '18:00',
        breaks: [],
        isClosed: false
      });
      
      // Calendário padrão começa às 08:00
      fixture.componentRef.setInput('currentDate', new Date('2026-03-23T10:00:00'));
      fixture.detectChanges();
      const blocks = component.getUnavailableBlocksForDay(mockDate);
      
      // Bloco das 08:00 às 10:00
      const morningBlock = blocks.find(b => b.top === 0);
      expect(morningBlock?.height).toBe(120 * 1.5); // 120 min * 1.5 = 180px
    });
  });

  describe('Interações e Emissões', () => {
    it('deve emitir a data correta ao navegar para a próxima semana', () => {
      vi.spyOn(component.dateChange, 'emit');
      component.nextWeek();
      
      const expectedDate = new Date(mockDate);
      expectedDate.setDate(expectedDate.getDate() + 7);
      
      expect(component.dateChange.emit).toHaveBeenCalledWith(expectedDate);
    });

    it('deve emitir editAppointment ao clicar em um agendamento', () => {
      vi.spyOn(component.editAppointment, 'emit');
      const app: Appointment = { 
        id: '1', 
        status: AppointmentStatus.CONFIRMED,
        clientId: 'c1',
        serviceIds: ['s1'],
        date: '2026-03-22',
        startTime: '10:00',
        totalDurationMinutes: 60,
        totalPrice: 100
      };
      const event = new MouseEvent('click');
      
      component.handleAppointmentClick(app, event);
      expect(component.editAppointment.emit).toHaveBeenCalledWith(app);
    });
  });
});
