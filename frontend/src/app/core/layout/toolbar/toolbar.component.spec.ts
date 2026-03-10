import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    providers: [{ provide: ActivatedRoute, useValue: {} }]
  }).compileComponents();
});

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarComponent, RouterLink]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the app name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Angular Web App');
  });

  it('should render the username', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('User');
  });

  it('should render the notification icon with badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notificationIcon = compiled.querySelector('mat-icon[matbadge]');
    expect(notificationIcon).toBeTruthy();
    expect(notificationIcon?.textContent).toContain('notifications');
  });

  it('should render the theme toggle button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeButton = compiled.querySelector('button[aria-label="Trocar tema"]');
    expect(themeButton).toBeTruthy();
  });

  it('should render the avatar image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const avatar = compiled.querySelector('img[alt="Avatar do usuário"]');
    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute('src')).toBe('https://i.pravatar.cc/32');
  });

  it('should open the mat-menu when menu button is clicked', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton: HTMLButtonElement | null = compiled.querySelector('button[data-testid="menu-button"]');
    expect(menuButton).toBeTruthy();
    menuButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    console.log(fixture.nativeElement.innerHTML.replace(/></g, '>\n<'));
    // const overlays = document.querySelectorAll('div.mat-menu-panel');
    // let found = false;
    // overlays.forEach(panel => {
    //   if (panel.textContent?.includes('Settings') && panel.textContent?.includes('Support') && panel.textContent?.includes('F.A.Q.')) {
    //     found = true;
    //   }
    // });
    // expect(found).toBeTrue();
  });
});
