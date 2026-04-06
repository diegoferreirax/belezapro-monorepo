import { Component, inject, effect, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../../../core/services/schedule.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DayScheduleConfig } from '../../../core/models/salon.models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ScheduleConfirmModalComponent } from './confirm-modal/confirm-modal';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ScheduleConfirmModalComponent],
  templateUrl: './schedule.html'
})
export class ScheduleComponent implements OnInit {
  private scheduleService = inject(ScheduleService);
  private appointmentService = inject(AppointmentService);

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
  conflictingAppointments = signal<{ date: string, count: number }[]>([]);
  private pendingConfigs: DayScheduleConfig[] = [];

  constructor() {
    this.generateTimeOptions();
    effect(() => {
      this.loadConfigs(this.mode(), this.currentWeekStart());
    });
  }

  ngOnInit() {
    this.scheduleService.loadConfigs();
    this.scheduleService.loadOverrides();
  }

  private generateTimeOptions() {
    const options: string[] = [];
    for (let h = 0; h < 24; h++) {
      const hourStr = h.toString().padStart(2, '0');
      options.push(`${hourStr}:00`);
      options.push(`${hourStr}:30`);
    }
    options.push('23:59');
    this.timeOptions = options;
  }

  getAvailableEndTimes(startTime: string): string[] {
    if (!startTime) return this.timeOptions;
    const startIndex = this.timeOptions.indexOf(startTime);
    return startIndex >= 0 ? this.timeOptions.slice(startIndex + 1) : this.timeOptions;
  }

  /** Apenas no dia corrente: opções de início do expediente não incluem horas já passadas. */
  getAvailableStartTimes(config: DayScheduleConfig): string[] {
    if (!this.isConfigForToday(config)) {
      return this.timeOptions;
    }
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const filtered = this.timeOptions.filter(t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m >= nowMinutes;
    });
    return filtered.length > 0 ? filtered : this.timeOptions;
  }

  private getTodayDateStr(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  private isConfigForToday(config: DayScheduleConfig): boolean {
    if (this.mode() === 'specific') {
      return !!config.date && config.date === this.getTodayDateStr();
    }
    return config.dayOfWeek === new Date().getDay();
  }

  /** Se o início salvo ficou inválido para o dia atual (hora já passou), ajusta e recalcula o fim. */
  private clampStartsForToday(): void {
    for (const config of this.dayConfigs()) {
      if (config.isClosed) continue;
      const available = this.getAvailableStartTimes(config);
      if (available.length === 0) continue;
      if (!available.includes(config.startTime)) {
        config.startTime = available[0];
        this.onStartTimeChange(config);
      }
    }
  }

  onStartTimeChange(config: DayScheduleConfig) {
    const validEndTimes = this.getAvailableEndTimes(config.startTime);
    if (config.endTime && !validEndTimes.includes(config.endTime)) {
      config.endTime = validEndTimes.length > 0 ? validEndTimes[0] : config.startTime;
    }
  }

  onBreakStartTimeChange(brk: { start: string, end: string }) {
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
      this.dayConfigs.set(JSON.parse(JSON.stringify(this.scheduleService.configs())));
    } else {
      const configs: DayScheduleConfig[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toLocaleDateString('en-CA');
        const configForDate = this.scheduleService.getConfigForDate(dateStr);
        if (configForDate) {
          const dayOfWeek = currentDate.getDay();
          configs.push(JSON.parse(JSON.stringify({ ...configForDate, date: dateStr, dayOfWeek })));
        }
      }
      this.dayConfigs.set(configs);
    }
    this.clampStartsForToday();
  }

  saveConfigs() {
    if (this.mode() === 'specific') {
      const closedDates = this.dayConfigs()
        .filter(c => c.isClosed && c.date)
        .map(c => c.date!);

      if (closedDates.length === 0) {
        this.executeSave(this.dayConfigs());
        return;
      }

      // Consulta de forma asíncrona a existência de conflitos para cada data fechada
      const requests = closedDates.map(date =>
        this.appointmentService.getActiveByDate(date).pipe(
          map(apps => ({ date, count: apps.length }))
        )
      );

      forkJoin(requests).subscribe(results => {
        const conflicts = results.filter(r => r.count > 0);
        if (conflicts.length > 0) {
          this.conflictingAppointments.set(conflicts);
          this.pendingConfigs = [...this.dayConfigs()];
          this.isConfirmModalOpen.set(true);
        } else {
          this.executeSave(this.dayConfigs());
        }
      });
      return;
    }

    this.executeSave(this.dayConfigs());
  }

  confirmSaveAndCancel() {
    const conflicts = this.conflictingAppointments();
    if (conflicts.length === 0) return;

    const requests = conflicts.map(c => this.appointmentService.cancelAppointmentsByDate(c.date));
    
    forkJoin(requests).subscribe({
      next: () => {
        this.executeSave(this.pendingConfigs);
        this.closeConfirmModal();
      },
      error: () => alert('Erro ao cancelar agendamentos conflitantes no servidor.')
    });
  }

  private executeSave(configs: DayScheduleConfig[]) {
    if (this.mode() === 'default') {
      this.scheduleService.saveConfigs(configs).subscribe({
        next: () => alert('Horários padrão salvos com sucesso!'),
        error: () => alert('Erro ao salvar horários.')
      });
    } else {
      const defaultConfigs = this.scheduleService.configs();
      const existingOverrides = this.scheduleService.overrides();
      const overrides: Record<string, DayScheduleConfig> = {};

      configs.forEach(config => {
        if (!config.date) return;

        const defaultForDay = defaultConfigs.find(d => d.dayOfWeek === config.dayOfWeek);
        const differFromDefault = !defaultForDay
          || config.isClosed !== defaultForDay.isClosed
          || config.startTime !== defaultForDay.startTime
          || config.endTime !== defaultForDay.endTime
          || JSON.stringify(config.breaks) !== JSON.stringify(defaultForDay.breaks);

        const hasExistingOverride = !!existingOverrides[config.date];

        if (differFromDefault || hasExistingOverride) {
          overrides[config.date] = config;
        }
      });

      if (Object.keys(overrides).length === 0) {
        alert('Nenhuma alteração detectada em relação ao horário padrão.');
        return;
      }

      this.scheduleService.saveOverrides(overrides).subscribe({
        next: () => alert('Exceções de horário salvas com sucesso!'),
        error: () => alert('Erro ao salvar exceções.')
      });
    }
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
    const [, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }
}
