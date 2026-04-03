import { TestBed } from '@angular/core/testing';
import { ScheduleCalculatorService } from './schedule-calculator.service';
import { Appointment, AppointmentStatus } from '../models/salon.models';
import { SalonService } from './salon.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ScheduleCalculatorService', () => {
  let service: ScheduleCalculatorService;
  let salonServiceSpy: { getScheduleForDate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    salonServiceSpy = {
      getScheduleForDate: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        ScheduleCalculatorService,
        { provide: SalonService, useValue: salonServiceSpy }
      ]
    });
    service = TestBed.inject(ScheduleCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array if date is missing or duration is 0', () => {
    expect(service.getAvailableTimes('' as string, 30, [])).toEqual([]);
    expect(service.getAvailableTimes('2026-03-15', 0, [])).toEqual([]);
  });

  it('should return empty array if day is closed', () => {
    salonServiceSpy.getScheduleForDate.mockReturnValue({ dayOfWeek: 0, startTime: '09:00', endTime: '18:00', breaks: [], isClosed: true });
    expect(service.getAvailableTimes('2026-03-15', 30, [])).toEqual([]);
  });

  it('should return available times for a normal day without breaks or appointments', () => {
    salonServiceSpy.getScheduleForDate.mockReturnValue({ dayOfWeek: 1, startTime: '09:00', endTime: '11:00', breaks: [], isClosed: false });
    const result = service.getAvailableTimes('2026-04-16', 60, []);
    expect(result).toEqual(['09:00', '09:30', '10:00']);
  });

  it('should skip times that overlap with breaks', () => {
    salonServiceSpy.getScheduleForDate.mockReturnValue({ 
      dayOfWeek: 1, 
      startTime: '09:00', 
      endTime: '12:00', 
      breaks: [{ start: '10:00', end: '11:00' }], 
      isClosed: false 
    });
    const result = service.getAvailableTimes('2026-04-16', 60, []);
    expect(result).toEqual(['09:00', '11:00']);
  });

  it('should skip times that overlap with existing appointments', () => {
    salonServiceSpy.getScheduleForDate.mockReturnValue({ dayOfWeek: 1, startTime: '09:00', endTime: '12:00', breaks: [], isClosed: false });
    const appointments: Appointment[] = [
      {
        id: '1',
        clientId: 'c1',
        serviceIds: ['s1'],
        date: '2026-04-16',
        startTime: '10:00',
        totalDurationMinutes: 60,
        totalPrice: 50,
        status: AppointmentStatus.CONFIRMED
      }
    ];
    const result = service.getAvailableTimes('2026-04-16', 30, appointments);
    expect(result).toEqual(['09:00', '09:30', '11:00', '11:30']);
  });

  it('should ignore cancelled appointments', () => {
    salonServiceSpy.getScheduleForDate.mockReturnValue({ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', breaks: [], isClosed: false });
    const appointments: Appointment[] = [
      {
        id: '1',
        clientId: 'c1',
        serviceIds: ['s1'],
        date: '2026-04-16',
        startTime: '09:00',
        totalDurationMinutes: 30,
        totalPrice: 50,
        status: AppointmentStatus.CANCELLED
      }
    ];
    const result = service.getAvailableTimes('2026-04-16', 30, appointments);
    expect(result).toEqual(['09:00', '09:30']);
  });

  it('should ignore the appointment being edited', () => {
    salonServiceSpy.getScheduleForDate.mockReturnValue({ dayOfWeek: 1, startTime: '09:00', endTime: '12:00', breaks: [], isClosed: false });
    const appointments: Appointment[] = [
      {
        id: '1',
        clientId: 'c1',
        serviceIds: ['s1'],
        date: '2026-04-16',
        startTime: '10:00',
        totalDurationMinutes: 60,
        totalPrice: 50,
        status: AppointmentStatus.CONFIRMED
      }
    ];
    // Exclude appointment '1'
    const result = service.getAvailableTimes('2026-04-16', 60, appointments, '1');
    // Since it's excluded, it should be able to be scheduled at 10:00
    expect(result).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00']);
  });
});
