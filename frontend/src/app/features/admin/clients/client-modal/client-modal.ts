import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Client } from '../../../../core/models/salon.models';
import { SalonService } from '../../../../core/services/salon.service';
import { EmailMaskDirective } from '../../../../shared/directives/email-mask.directive';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, EmailMaskDirective],
  templateUrl: './client-modal.html'
})
export class ClientModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() client: Client | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private salonService = inject(SalonService);

  clientForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      if (this.client) {
        this.clientForm.patchValue(this.client);
      } else {
        this.clientForm.reset();
      }
    }
  }

  closeModal() {
    this.closed.emit();
  }

  isEmailInvalid(): boolean {
    const control = this.clientForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  getEmailErrorMessage(): string {
    const control = this.clientForm.get('email');
    if (control?.hasError('required')) return 'O e-mail é obrigatório.';
    if (control?.hasError('email')) return 'Digite um e-mail válido.';
    return '';
  }

  async saveClient() {
    if (this.clientForm.invalid) return;

    const formValue = this.clientForm.getRawValue();
    const clientData: Client = {
      id: this.client?.id || crypto.randomUUID(),
      name: formValue.name!,
      email: formValue.email!,
      phone: formValue.phone!,
      isBlocked: this.client?.isBlocked || false
    };

    try {
      if (this.client) {
        await this.salonService.updateClient(clientData);
      } else {
        await this.salonService.addClient(clientData);
      }
      this.saved.emit();
      this.closeModal();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar cliente');
    }
  }
}
