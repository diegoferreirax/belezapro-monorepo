import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-schedule-confirm-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-modal.html'
})
export class ScheduleConfirmModalComponent {
  @Input() isOpen = false;
  @Input() conflicts: { date: string; count: number }[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const [, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }
}
