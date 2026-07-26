import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { TenantDetailComponent } from './tenant-detail.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TenantDto } from '../../models/platform.model';

describe('TenantDetailComponent', () => {
  let fixture: ComponentFixture<TenantDetailComponent>;
  let component: TenantDetailComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  const tenant: TenantDto = {
    id: 't1',
    name: 'Acme',
    slug: 'acme',
    email: 'owner@acme.com',
    phone: null,
    logoUrl: null,
    paymentInstructions: null,
    isActive: true,
    createdAt: '2026-01-01',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getTenant: vi.fn().mockReturnValue(of(tenant)),
      deleteTenant: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TenantDetailComponent],
      providers: [
        provideRouter([]),
        { provide: PlatformAdminService, useValue: mockPlatform },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 't1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the tenant', () => {
    expect(component.tenant?.name).toBe('Acme');
  });

  it('requires the typed tenant slug before deletion is confirmable', () => {
    component.openDeleteModal();
    expect(component.deleteModalOpen).toBe(true);
    expect(component.requireTypedConfirmation).toBe('acme');
  });

  it('deletes the tenant and navigates back to the list on confirm', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onDeleteConfirmed();
    expect(mockPlatform.deleteTenant).toHaveBeenCalledWith('t1');
    expect(navSpy).toHaveBeenCalledWith(['/admin/platform/tenants']);
  });
});
