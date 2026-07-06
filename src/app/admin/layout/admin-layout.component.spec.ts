import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../core/services/auth.service';

describe('AdminLayoutComponent', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;
  let component: AdminLayoutComponent;
  let mockAuth: Partial<AuthService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockAuth = {
      getRoles: vi.fn().mockReturnValue(['AdminOwner']),
      isSuperAdmin: vi.fn().mockReturnValue(false),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds the tenant menu for a tenant-admin role', () => {
    expect(component.isPlatform).toBe(false);
    expect(component.menuItems.map((i) => i.label)).toContain('Settings');
  });

  it('builds the platform menu for SuperAdmin', () => {
    (mockAuth.isSuperAdmin as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (mockAuth.getRoles as ReturnType<typeof vi.fn>).mockReturnValue(['SuperAdmin']);
    component.ngOnInit();
    expect(component.isPlatform).toBe(true);
    expect(component.menuItems.map((i) => i.label)).toContain('Tenants');
  });

  it('starts with the drawer closed', () => {
    expect(component.isDrawerOpen).toBe(false);
  });

  it('toggles the drawer open and closed', () => {
    component.toggleDrawer();
    expect(component.isDrawerOpen).toBe(true);
    component.toggleDrawer();
    expect(component.isDrawerOpen).toBe(false);
  });

  it('closes the drawer explicitly', () => {
    component.isDrawerOpen = true;
    component.closeDrawer();
    expect(component.isDrawerOpen).toBe(false);
  });

  it('logs out and clears session on onLogout', () => {
    component.onLogout();
    expect(mockAuth.logout).toHaveBeenCalled();
  });

  it('renders the toast container', () => {
    const el = fixture.nativeElement.querySelector('app-toast-container');
    expect(el).toBeTruthy();
  });
});
