import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MfaSetupComponent } from './mfa-setup.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';

describe('MfaSetupComponent', () => {
  let fixture: ComponentFixture<MfaSetupComponent>;
  let component: MfaSetupComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      setupMfa: vi.fn().mockReturnValue(of({ qrCodeUrl: 'data:image/png;base64,abc', secretBase32: 'SECRET' })),
      verifyMfaSetup: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MfaSetupComponent, FormsModule],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }, { provide: ToastService, useValue: mockToast }],
    }).compileComponents();
    fixture = TestBed.createComponent(MfaSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetches the QR code and secret on init', () => {
    expect(component.qrCodeUrl).toBe('data:image/png;base64,abc');
    expect(component.secretBase32).toBe('SECRET');
  });

  it('verifies the setup code and shows success', () => {
    component.verificationCode = '123456';
    component.onVerify();
    expect(mockPlatform.verifyMfaSetup).toHaveBeenCalledWith('123456');
    expect(component.verified).toBe(true);
  });

  it('shows an error on an invalid code', () => {
    (mockPlatform.verifyMfaSetup as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('invalid')));
    component.verificationCode = '000000';
    component.onVerify();
    expect(mockToast.error).toHaveBeenCalled();
    expect(component.verified).toBe(false);
  });
});
