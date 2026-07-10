import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PaymentListComponent } from './payment-list.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PlatformPaymentDto } from '../../models/platform.model';

describe('PaymentListComponent', () => {
  let fixture: ComponentFixture<PaymentListComponent>;
  let component: PaymentListComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  const payment: PlatformPaymentDto = {
    id: 'pay1',
    tenantId: 't1',
    subscriptionId: 's1',
    amount: 99,
    dueDate: '2026-07-01',
    paidAt: null,
    status: 'Pending',
  };
  const payment2: PlatformPaymentDto = { ...payment, id: 'pay2', status: 'Confirmed', paidAt: '2026-07-02' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getPayments: vi.fn().mockReturnValue(of([payment, payment2])),
      confirmPayment: vi.fn().mockReturnValue(of({ ...payment, status: 'Confirmed' })),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PaymentListComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }, { provide: ToastService, useValue: mockToast }],
    }).compileComponents();
    fixture = TestBed.createComponent(PaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not load until a subscription id is entered', () => {
    expect(mockPlatform.getPayments).not.toHaveBeenCalled();
    expect(component.payments.length).toBe(0);
  });

  it('loads payments once a subscription id is entered', () => {
    component.onSubscriptionIdChange('s1');
    expect(mockPlatform.getPayments).toHaveBeenCalledWith('s1');
    expect(component.payments.length).toBe(2);
  });

  it('renders exactly one row per payment (no duplicate rendering)', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#subscription-id');
    input.value = 's1';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.payments.length);
    expect(rows.length).toBe(2);
  });

  it('confirms a payment', () => {
    component.onSubscriptionIdChange('s1');
    component.onConfirm(payment);
    expect(mockPlatform.confirmPayment).toHaveBeenCalledWith('pay1');
  });
});
