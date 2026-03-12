import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from 'core/models/login.model';
import { AuthService } from 'core/services/auth.service';
import { LoginService } from 'core/services/login.service';
import { MaterialModule } from 'modules/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  protected readonly form: FormGroup<any>;
  private readonly authService = inject(AuthService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    if (this.form.invalid) {
      return;
    }

    const credentials: LoginRequest = this.form.getRawValue();

    this.loginService.login(credentials).subscribe({
      next: (response) => {
        this.authService.login();
        this.router.navigate(['/']);
      },
      error: (err) => {
        // Tratar erro de login
        console.error('Login failed', err);
      }
    });
  }
}
