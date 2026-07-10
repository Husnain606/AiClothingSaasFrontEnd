import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformBankAccountComponent } from './platform-bank-account.component';
import { PlatformAdminService } from '../../services/platform-admin.service';

describe('PlatformBankAccountComponent', () => {
  let fixture: ComponentFixture<PlatformBankAccountComponent>;
  let component: PlatformBankAccountComponent;
  let mockPlatform: Partial<PlatformAdminService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getPlatformBankAccount: vi.fn().mockReturnValue(
        of({ id: 'b1', tenantId: null, accountTitle: 'Platform Inc', accountNumber: '****9999', bankName: 'Wells Fargo', branchCode: '001', iban: '', isActive: true })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [PlatformBankAccountComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }],
    }).compileComponents();
    fixture = TestBed.createComponent(PlatformBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the masked platform bank account', () => {
    expect(component.account?.accountNumber).toBe('****9999');
  });
});
