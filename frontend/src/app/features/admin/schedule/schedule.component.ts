import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/services/salon.service';
import { DayScheduleConfig } from '../../../core/models/salon.models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ScheduleConfirmModalComponent } from './confirm-modal/confirm-modal';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ScheduleConfirmModalComponent],
  templateUrl: './schedule.html'
})
export class ScheduleComponent {
  private salonService = inject(SalonService);

  mode = signal<'default' | 'specific'>('specific');
  currentWeekStart = signal<Date>(this.getStartOfWeek(new Date()));
  
  dayConfigs = signal<DayScheduleConfig[]>([]);
  weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  timeOptions: string[] = [];

  weekRangeDisplay = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return `${startStr} - ${endStr}`;
  });

  canGoToPrevWeek = computed(() => {
    const currentViewStart = new Date(this.currentWeekStart());
    const actualCurrentWeekStart = this.getStartOfWeek(new Date());
    
    currentViewStart.setHours(0, 0, 0, 0);
    actualCurrentWeekStart.setHours(0, 0, 0, 0);
    
    return currentViewStart > actualCurrentWeekStart;
  });

  isConfirmModalOpen = signal(false);
  conflictingAppointments = signal<{date: string, count: number}[]>([]);
  private pendingConfigs: DayScheduleConfig[] = [];

  constructor() {
    this.generateTimeOptions();
    effect(() => {
      this.loadConfigs(this.mode(), this.currentWeekStart());
    });
  }

  private generateTimeOptions() {
    const options = [];
    for (let h = 0; h < 24; h++) {
      const hourStr = h.toString().padStart(2, '0');
      options.push(`${hourStr}:00`);
      options.push(`${hourStr}:30`);
    }
    options.push('23:59'); // Adiciona o fim do dia para permitir turnos até meia-noite
    this.timeOptions = options;
  }

  getAvailableEndTimes(startTime: string): string[] {
    if (!startTime) return this.timeOptions;
    const startIndex = this.timeOptions.indexOf(startTime);
    return startIndex >= 0 ? this.timeOptions.slice(startIndex + 1) : this.timeOptions;
  }

  onStartTimeChange(config: DayScheduleConfig) {
    const validEndTimes = this.getAvailableEndTimes(config.startTime);
    if (config.endTime && !validEndTimes.includes(config.endTime)) {
      config.endTime = validEndTimes.length > 0 ? validEndTimes[0] : config.startTime;
    }
  }

  onBreakStartTimeChange(brk: {start: string, end: string}) {
    const validEndTimes = this.getAvailableEndTimes(brk.start);
    if (brk.end && !validEndTimes.includes(brk.end)) {
      brk.end = validEndTimes.length > 0 ? validEndTimes[0] : brk.start;
    }
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  setMode(newMode: 'default' | 'specific') {
    this.mode.set(newMode);
  }

  prevWeek() {
    const current = this.currentWeekStart();
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 7);
    this.currentWeekStart.set(prev);
  }

  nextWeek() {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.currentWeekStart.set(next);
  }

  goToCurrentWeek() {
    this.currentWeekStart.set(this.getStartOfWeek(new Date()));
  }

  loadConfigs(mode: 'default' | 'specific', weekStart: Date) {
    if (mode === 'default') {
      const defaults = this.salonService.scheduleConfigs();
      this.dayConfigs.set(JSON.parse(JSON.stringify(defaults)));
    } else {
      const configs: DayScheduleConfig[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
        
        const configForDate = this.salonService.getScheduleForDate(dateStr);
        if (configForDate) {
          configs.push(JSON.parse(JSON.stringify(configForDate)));
        }
      }
      this.dayConfigs.set(configs);
    }
  }

  async saveConfigs() {
    const conflicts: {date: string, count: number}[] = [];
    
    if (this.mode() === 'specific') {
      this.dayConfigs().forEach(config => {
        if (config.isClosed && config.date) {
          const activeApps = this.salonService.getActiveAppointmentsByDate(config.date);
          if (activeApps.length > 0) {
            conflicts.push({ date: config.date, count: activeApps.length });
          }
        }
      });
    }

    if (conflicts.length > 0) {
      this.conflictingAppointments.set(conflicts);
      this.pendingConfigs = [...this.dayConfigs()];
      this.isConfirmModalOpen.set(true);
      return;
    }

    this.executeSave(this.dayConfigs());
  }

  confirmSaveAndCancel() {
    const conflicts = this.conflictingAppointments();
    conflicts.forEach(c => {
      this.salonService.cancelAppointmentsByDate(c.date);
    });

    this.executeSave(this.pendingConfigs);
    this.closeConfirmModal();
  }

  private executeSave(configs: DayScheduleConfig[]) {
    if (this.mode() === 'default') {
      const configsToSave = configs.map(c => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { date, ...rest } = c;
        return rest;
      });
      this.salonService.saveScheduleConfigs(configsToSave);
    } else {
      const overrides: Record<string, DayScheduleConfig> = {};
      configs.forEach(config => {
        if (config.date) {
          overrides[config.date] = config;
        }
      });
      this.salonService.saveScheduleOverrides(overrides);
    }
    alert('Configurações salvas com sucesso!');
  }

  closeConfirmModal() {
    this.isConfirmModalOpen.set(false);
    this.conflictingAppointments.set([]);
    this.pendingConfigs = [];
  }

  addBreak(config: DayScheduleConfig) {
    config.breaks.push({ start: '12:00', end: '13:00' });
  }

  removeBreak(config: DayScheduleConfig, index: number) {
    config.breaks.splice(index, 1);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }
}
