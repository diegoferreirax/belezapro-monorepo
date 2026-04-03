import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-modal.html'
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar Ação';
  @Input() subtitle = 'Ação irreversível.';
  @Input() message = 'Tem certeza que deseja realizar esta ação?';
  @Input() warningMessage = 'Esta ação não pode ser desfeita.';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() icon = 'warning';
  @Input() confirmColor: 'rose' | 'stone' = 'rose';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  confirmAction() {
    this.confirmed.emit();
  }
}
