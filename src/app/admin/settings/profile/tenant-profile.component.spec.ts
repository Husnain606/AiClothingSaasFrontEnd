import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TenantProfileComponent } from './tenant-profile.component';
import { SettingsAdminService } from '../services/settings-admin.service';
import { ToastService } from '../../shared/services/toast.service';

describe('TenantProfileComponent', () => {
  let fixture: ComponentFixture<TenantProfileComponent>;
  let component: TenantProfileComponent;
  let mockSettings: Partial<SettingsAdminService>;
  let mockToast: Partial<ToastService>;

  const profile = {
    id: 't1',
    name: 'Acme',
    slug: 'acme',
    email: 'a@b.com',
    phone: '555',
    logoUrl: null,
    isActive: true,
    createdAt: '2026-01-01',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockSettings = {
      getProfile: vi.fn().mockReturnValue(of(profile)),
      updateProfile: vi.fn().mockReturnValue(of(profile)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TenantProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: SettingsAdminService, useValue: mockSettings },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and patches the profile form', () => {
    expect(component.form.value.name).toBe('Acme');
    expect(component.form.value.phone).toBe('555');
  });

  it('saves the updated profile', () => {
    component.form.patchValue({ name: 'Acme Updated' });
    component.onSubmit();
    expect(mockSettings.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Acme Updated' }));
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('surfaces a save failure via a toast', () => {
    (mockSettings.updateProfile as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    component.onSubmit();
    expect(mockToast.error).toHaveBeenCalled();
  });

  it('does not submit an invalid form', () => {
    component.form.patchValue({ name: '' });
    component.onSubmit();
    expect(mockSettings.updateProfile).not.toHaveBeenCalled();
  });
});
