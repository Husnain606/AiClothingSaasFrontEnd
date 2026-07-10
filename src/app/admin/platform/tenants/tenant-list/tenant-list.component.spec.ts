import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TenantListComponent } from './tenant-list.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TenantDto } from '../../models/platform.model';

describe('TenantListComponent', () => {
  let fixture: ComponentFixture<TenantListComponent>;
  let component: TenantListComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  const tenant: TenantDto = {
    id: 't1',
    name: 'Acme',
    slug: 'acme',
    email: 'owner@acme.com',
    phone: null,
    logoUrl: null,
    isActive: true,
    createdAt: '2026-01-01',
  };
  const tenant2: TenantDto = { ...tenant, id: 't2', name: 'Beta', slug: 'beta', isActive: false };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getTenants: vi.fn().mockReturnValue(of({ items: [tenant, tenant2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })),
      suspendTenant: vi.fn().mockReturnValue(of({ ...tenant, isActive: false })),
      activateTenant: vi.fn().mockReturnValue(of(tenant)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TenantListComponent],
      providers: [
        provideRouter([]),
        { provide: PlatformAdminService, useValue: mockPlatform },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads tenants on init', () => {
    expect(component.rows.length).toBe(2);
  });

  it('renders exactly one row per tenant (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.rows.length);
    expect(rows.length).toBe(2);
  });

  it('suspends a tenant', () => {
    component.onSuspend(tenant);
    expect(mockPlatform.suspendTenant).toHaveBeenCalledWith('t1');
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('activates a tenant', () => {
    component.onActivate(tenant2);
    expect(mockPlatform.activateTenant).toHaveBeenCalledWith('t2');
    expect(mockToast.success).toHaveBeenCalled();
  });
});
