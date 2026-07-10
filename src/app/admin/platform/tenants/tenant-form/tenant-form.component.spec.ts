import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { TenantFormComponent } from './tenant-form.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('TenantFormComponent', () => {
  let fixture: ComponentFixture<TenantFormComponent>;
  let component: TenantFormComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = { createTenant: vi.fn().mockReturnValue(of({ id: 't2' })) };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TenantFormComponent],
      providers: [
        provideRouter([]),
        { provide: PlatformAdminService, useValue: mockPlatform },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates a tenant and navigates to the list', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ name: 'New Co', slug: 'new-co', email: 'owner@newco.com' });
    component.onSubmit();
    expect(mockPlatform.createTenant).toHaveBeenCalledWith({ name: 'New Co', slug: 'new-co', email: 'owner@newco.com' });
    expect(navSpy).toHaveBeenCalledWith(['/admin/platform/tenants']);
  });

  it('does not submit an invalid form', () => {
    component.form.patchValue({ name: '' });
    component.onSubmit();
    expect(mockPlatform.createTenant).not.toHaveBeenCalled();
  });
});
