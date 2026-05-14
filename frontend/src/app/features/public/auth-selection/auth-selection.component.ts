import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-auth-selection',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './auth-selection.html',
    host: { class: 'block' },
})
export class AuthSelectionComponent {
    private readonly router = inject(Router);

    selectRole(role: 'admin' | 'client') {
        if (role === 'admin') {
            this.router.navigate(['/login']);
        } else {
            this.router.navigate(['/entrar']);
        }
    }
}