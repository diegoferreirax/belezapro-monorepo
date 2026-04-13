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
      this.authService.requestClientOtp(this.otpForm.value.email).subscribe({
        next: () => {
          this.codeSent = true;
          this.otpForm.get('email')?.disable(); // Disable editing of email after sending
          alert('Código OTP enviado ao e-mail ' + this.otpForm.getRawValue().email);
        },
        error: (err) => {
          alert('Erro ao processar solicitação de OTP. Verifique os logs.');
        }
      });
    } else {
      alert('Por favor, insira um e-mail válido.');
    }
  }

  onSubmit() {
    if (this.otpForm.valid) {
      const email = this.otpForm.getRawValue().email;
      const otp = this.otpForm.value.otp;
      
      this.authService.validateClientOtp(email, otp).subscribe({
        next: () => {
          this.router.navigate(['/client']);
        },
        error: (err) => {
          if (err.status === 401) {
            alert('Acesso Negado: Código inválido, expirado ou usuário bloqueado.');
          } else {
            alert('Falha na conexão com o servidor de autenticação.');
          }
        }
      });
    }
  }
}
