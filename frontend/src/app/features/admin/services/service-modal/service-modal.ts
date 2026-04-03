import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Service } from '../../../../core/models/salon.models';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, DurationFormatPipe],
  templateUrl: './service-modal.html'
})
export class ServiceModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() service: Service | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Service>();

  // Opções de duração de 30 em 30 minutos (até 6 horas)
  durationOptions = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);

  serviceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
    durationMinutes: [30, [Validators.required, Validators.min(30)]],
    isActive: [true]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (this.service) {
        this.serviceForm.patchValue(this.service);
      } else {
        this.serviceForm.reset({ price: 0, durationMinutes: 30, isActive: true });
      }
    }
  }

  closeModal() {
    this.closed.emit();
  }

  saveService() {
    if (this.serviceForm.invalid) return;

    const formValue = this.serviceForm.getRawValue();
    const serviceData: Service = {
      id: this.service?.id || crypto.randomUUID(),
      name: formValue.name!,
      price: formValue.price!,
      durationMinutes: formValue.durationMinutes!,
      isActive: formValue.isActive!
    };

    this.saved.emit(serviceData);
  }
}
