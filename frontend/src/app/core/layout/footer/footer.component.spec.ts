import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const year = new Date().getFullYear();
    expect(compiled.textContent).toContain(year.toString());
  });

  it('should render the developer name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Desenvolvido por');
    expect(compiled.textContent).toContain('Diego');
  });

  it('should have a link to LinkedIn', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://linkedin.com/in/diegoferreirax');
    expect(link?.getAttribute('target')).toBe('_blank');
  });
});
