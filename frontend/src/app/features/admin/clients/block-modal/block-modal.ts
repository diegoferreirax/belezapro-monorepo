import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Client } from '../../../../core/models/salon.models';

@Component({
  selector: 'app-client-block-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './block-modal.html'
})
export class ClientBlockModalComponent {
  @Input() isOpen = false;
  @Input() client: Client | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }
}
