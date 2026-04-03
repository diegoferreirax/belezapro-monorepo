import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-otp-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './otp-login.html'
})
export class OtpLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  codeSent = false;

  otpForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    otp: ['']
  });

  sendCode() {
    if (this.otpForm.get('email')?.valid) {
      this.codeSent = true;
      alert('Código enviado para ' + this.otpForm.value.email);
    } else {
      alert('Por favor, insira um e-mail válido.');
    }
  }

  onSubmit() {
    if (this.otpForm.valid) {
      try {
        if (this.authService.loginClient(this.otpForm.value.email, this.otpForm.value.otp)) {
          this.router.navigate(['/client']);
        } else {
          alert('E-mail ou OTP inválidos');
        }
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : 'Erro ao fazer login');
      }
    }
  }
}
