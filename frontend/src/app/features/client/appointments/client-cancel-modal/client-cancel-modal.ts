import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-cancel-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './client-cancel-modal.html'
})
export class ClientCancelModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  confirmCancel() {
    this.confirmed.emit();
  }
}
