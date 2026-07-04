import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/cart/services/cart.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: {
    logout: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    isTenantAdmin: ReturnType<typeof vi.fn>;
    isSuperAdmin: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: typeof authService;

  beforeEach(async () => {
    authService = {
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(of(false)),
      getCurrentUser: vi.fn().mockReturnValue(of(null)),
      isTenantAdmin: vi.fn().mockReturnValue(false),
      isSuperAdmin: vi.fn().mockReturnValue(false),
    };
    mockAuthService = authService;
    const cartServiceMock = {
      cart$: of({ items: [], subtotal: 0, tax: 0, total: 0, itemCount: 2 }),
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize observables on ngOnInit', async () => {
    component.ngOnInit();
    const count = await new Promise<number>(resolve =>
      component.cartItemCount$.subscribe(c => resolve(c))
    );
    expect(count).toBe(2);
  });

  it('should toggle navbar visibility', () => {
    expect(component.isNavbarOpen).toBe(false);
    component.toggleNavbar();
    expect(component.isNavbarOpen).toBe(true);
    component.toggleNavbar();
    expect(component.isNavbarOpen).toBe(false);
  });

  it('should close navbar', () => {
    component.isNavbarOpen = true;
    component.closeNavbar();
    expect(component.isNavbarOpen).toBe(false);
  });

  it('should toggle user menu', () => {
    expect(component.isUserMenuOpen).toBe(false);
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should close user menu on outside click', () => {
    component.isUserMenuOpen = true;
    const outsideClick = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(outsideClick, 'target', { value: document.body });
    component.onDocumentClick(outsideClick);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should keep user menu open when clicking inside the header', () => {
    component.isUserMenuOpen = true;
    const insideClick = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(insideClick, 'target', {
      value: fixture.nativeElement,
    });
    component.onDocumentClick(insideClick);
    expect(component.isUserMenuOpen).toBe(true);
  });

  it('should logout and navigate to login on onLogout', () => {
    const routerSpy = vi.spyOn(component['router'], 'navigate').mockResolvedValue(true);
    component.onLogout();
    expect(authService.logout).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should display cart item count from service', async () => {
    component.ngOnInit();
    const count = await new Promise<number>(resolve =>
      component.cartItemCount$.subscribe(c => resolve(c))
    );
    expect(count).toBe(2);
  });

  it('should close user menu when navbar closes', () => {
    component.isNavbarOpen = true;
    component.isUserMenuOpen = true;
    component.closeNavbar();
    expect(component.isNavbarOpen).toBe(false);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('shows the Dashboard link for a tenant-admin role', async () => {
    mockAuthService.isTenantAdmin = vi.fn().mockReturnValue(true);
    mockAuthService.isSuperAdmin = vi.fn().mockReturnValue(false);
    mockAuthService.getCurrentUser = vi
      .fn()
      .mockReturnValue(of({ id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', roles: ['StoreManager'] }));
    component.ngOnInit();

    const visible = await firstValueFrom(component.showDashboardLink$);
    expect(visible).toBe(true);
  });

  it('hides the Dashboard link for a Customer', async () => {
    mockAuthService.isTenantAdmin = vi.fn().mockReturnValue(false);
    mockAuthService.isSuperAdmin = vi.fn().mockReturnValue(false);
    mockAuthService.getCurrentUser = vi
      .fn()
      .mockReturnValue(of({ id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', roles: ['Customer'] }));
    component.ngOnInit();

    const visible = await firstValueFrom(component.showDashboardLink$);
    expect(visible).toBe(false);
  });
});
