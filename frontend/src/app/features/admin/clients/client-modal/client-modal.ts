import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Client } from '../../../../core/models/salon.models';
import { ClientService } from '../../../../core/services/client.service';
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
  private clientService = inject(ClientService);

  clientForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      if (this.client) {
        this.clientForm.patchValue(this.client);
        this.clientForm.get('email')?.disable();
      } else {
        this.clientForm.reset();
        this.clientForm.get('email')?.enable();
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

  saveClient() {
    if (this.clientForm.invalid) return;

    const formValue = this.clientForm.getRawValue();

    if (this.client) {
      this.clientService.updateClient(this.client.id, {
        name: formValue.name!,
        phone: formValue.phone!
      }).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal();
        },
        error: (e: any) => alert(e?.error?.message || 'Erro ao atualizar cliente')
      });
    } else {
      this.clientService.createClient({
        name: formValue.name!,
        email: formValue.email!,
        phone: formValue.phone!
      }).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal();
        },
        error: (e: any) => alert(e?.error?.message || 'Erro ao criar cliente')
      });
    }
  }
}
