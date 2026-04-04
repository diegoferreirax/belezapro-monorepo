import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { DayScheduleConfig } from '../models/salon.models';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

// Backend retorna array de overrides — convertemos para Record para lookup O(1)
function overridesToRecord(overrides: DayScheduleConfig[]): Record<string, DayScheduleConfig> {
  return overrides.reduce((acc, o) => {
    if (o.date) acc[o.date] = o;
    return acc;
  }, {} as Record<string, DayScheduleConfig>);
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiService = inject(ApiService);

  configs = signal<DayScheduleConfig[]>([]);
  overrides = signal<Record<string, DayScheduleConfig>>({});

  loadConfigs(): void {
    this.apiService.get<DayScheduleConfig[]>('/schedule/config').subscribe({
      next: (data) => this.configs.set(data),
      error: (e: any) => console.error('Erro ao carregar horários padrão:', e)
    });
  }

  loadOverrides(): void {
    this.apiService.get<DayScheduleConfig[]>('/schedule/overrides').subscribe({
      next: (data) => this.overrides.set(overridesToRecord(data)),
      error: (e: any) => console.error('Erro ao carregar exceções de horário:', e)
    });
  }

  saveConfigs(configs: DayScheduleConfig[]): Observable<DayScheduleConfig[]> {
    // Strip campos desnecessários — backend só precisa de dayOfWeek + horários
    const payload = configs.map(({ dayOfWeek, startTime, endTime, breaks, isClosed }) => ({
      dayOfWeek, startTime, endTime, breaks, isClosed
    }));
    return this.apiService.put<DayScheduleConfig[]>('/schedule/config', payload).pipe(
      tap((data) => this.configs.set(data))
    );
  }

  saveOverrides(overridesMap: Record<string, DayScheduleConfig>): Observable<DayScheduleConfig[]> {
    // Strip campos extras (id, adminId, dayOfWeek) que existem em runtime mas
    // não pertencem ao ScheduleOverride do backend. Evita id-pollution no upsert.
    const payload = Object.values(overridesMap).map(({ date, startTime, endTime, breaks, isClosed }) => ({
      date, startTime, endTime, breaks, isClosed
    }));
    return this.apiService.put<DayScheduleConfig[]>('/schedule/overrides', payload).pipe(
      switchMap(() => this.apiService.get<DayScheduleConfig[]>('/schedule/overrides')),
      tap((data) => this.overrides.set(overridesToRecord(data)))
    );
  }

  getConfigForDate(dateStr: string): DayScheduleConfig | undefined {
    // 1. Override específico
    const override = this.overrides()[dateStr];
    if (override) return override;

    // 2. Config padrão do dia da semana
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
    return this.configs().find(c => c.dayOfWeek === dayOfWeek);
  }
}
