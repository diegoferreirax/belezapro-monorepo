import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuService } from 'core/services/menu-service';
import { MaterialModule } from 'modules/material.module';

@Component({
  selector: 'app-navegation',
  imports: [RouterLink, MaterialModule, RouterLinkActive, CommonModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.scss'
})
export class NavegationComponent {
  private readonly router = inject(Router);
  protected readonly menuService = inject(MenuService);
  public expandedIndex: number | null = null;

  protected isActiveRoute(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  public toggleSubmenu(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
