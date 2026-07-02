import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../features/cart/services/cart.service';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    const authServiceMock = {
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(of(false)),
      getCurrentUser: vi.fn().mockReturnValue(of(null)),
    };
    const cartServiceMock = {
      cart$: of({ items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 }),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header', () => {
    const header = fixture.nativeElement.querySelector('app-header');
    expect(header).toBeTruthy();
  });

  it('should render the footer', () => {
    const footer = fixture.nativeElement.querySelector('app-footer');
    expect(footer).toBeTruthy();
  });

  it('should render a router outlet inside the main content area', () => {
    const outlet = fixture.nativeElement.querySelector('main router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should use a flex column shell for the sticky footer layout', () => {
    const shell = fixture.nativeElement.querySelector('.app-shell');
    expect(shell).toBeTruthy();
    expect(shell.classList.contains('d-flex')).toBe(true);
    expect(shell.classList.contains('flex-column')).toBe(true);
  });

  it('should let the content area grow to push the footer down', () => {
    const content = fixture.nativeElement.querySelector('.app-shell__content');
    expect(content).toBeTruthy();
    expect(content.classList.contains('flex-grow-1')).toBe(true);
  });
});
