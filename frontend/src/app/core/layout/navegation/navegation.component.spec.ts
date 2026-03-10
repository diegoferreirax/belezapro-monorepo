import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavegationComponent } from './navegation.component';
import { ActivatedRoute, RouterLink } from '@angular/router';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    providers: [{ provide: ActivatedRoute, useValue: {} }]
  }).compileComponents();
});

describe('NavegationComponent', () => {
  let component: NavegationComponent;
  let fixture: ComponentFixture<NavegationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegationComponent, RouterLink]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavegationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
