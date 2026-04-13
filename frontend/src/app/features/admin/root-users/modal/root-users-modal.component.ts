import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SystemUser } from '../../../../core/services/system-user.service';

@Component({
  selector: 'app-root-users-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './root-users-modal.component.html'
})
export class RootUsersModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() user: SystemUser | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  roles = ['ROOT', 'ADMIN', 'CLIENT'];

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['CLIENT', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (this.user) {
        this.userForm.patchValue(this.user);
        this.userForm.get('password')?.clearValidators();
      } else {
        this.userForm.reset({ role: 'CLIENT' });
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  closeModal() {
    this.closed.emit();
  }

  saveUser() {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.getRawValue();
    this.saved.emit(formValue);
  }
}
