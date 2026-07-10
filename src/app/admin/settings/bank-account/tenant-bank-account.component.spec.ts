import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TenantBankAccountComponent } from './tenant-bank-account.component';
import { SettingsAdminService } from '../services/settings-admin.service';
import { ToastService } from '../../shared/services/toast.service';

describe('TenantBankAccountComponent', () => {
  let fixture: ComponentFixture<TenantBankAccountComponent>;
  let component: TenantBankAccountComponent;
  let mockSettings: Partial<SettingsAdminService>;
  let mockToast: Partial<ToastService>;

  const masked = {
    id: 'b1',
    tenantId: 't1',
    accountTitle: 'Acme',
    accountNumber: '****1234',
    bankName: 'Chase',
    branchCode: '0001',
    iban: 'PK00CHAS0000001234',
    isActive: true,
  };
  const full = { ...masked, accountNumber: '000000001234' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockSettings = {
      getBankAccount: vi.fn().mockReturnValue(of(masked)),
      getBankAccountFull: vi.fn().mockReturnValue(of(full)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TenantBankAccountComponent, FormsModule],
      providers: [
        { provide: SettingsAdminService, useValue: mockSettings },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the masked account by default', () => {
    expect(component.masked?.accountNumber).toBe('****1234');
    expect(component.full).toBeNull();
  });

  it('reveals the full account with a valid TOTP code', () => {
    component.totpCode = '123456';
    component.onReveal();
    expect(mockSettings.getBankAccountFull).toHaveBeenCalledWith('123456');
    expect(component.full?.accountNumber).toBe('000000001234');
  });

  it('shows an error toast for an invalid TOTP code', () => {
    (mockSettings.getBankAccountFull as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('invalid')));
    component.totpCode = '000000';
    component.onReveal();
    expect(mockToast.error).toHaveBeenCalled();
    expect(component.full).toBeNull();
  });
});
