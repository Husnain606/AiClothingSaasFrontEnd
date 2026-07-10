import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TenantSubscriptionComponent } from './tenant-subscription.component';
import { SettingsAdminService } from '../services/settings-admin.service';

describe('TenantSubscriptionComponent', () => {
  let fixture: ComponentFixture<TenantSubscriptionComponent>;
  let component: TenantSubscriptionComponent;
  let mockSettings: Partial<SettingsAdminService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockSettings = {
      getSubscription: vi.fn().mockReturnValue(
        of({
          id: 's1',
          tenantId: 't1',
          planName: 'Pro',
          status: 'Active',
          startDate: '2026-01-01',
          endDate: '2026-08-01',
          price: 99,
        })
      ),
      getPayments: vi.fn().mockReturnValue(
        of([
          {
            id: 'pay1',
            tenantId: 't1',
            subscriptionId: 's1',
            amount: 99,
            dueDate: '2026-07-01',
            paidAt: '2026-07-01',
            status: 'Confirmed',
          },
        ])
      ),
    };

    await TestBed.configureTestingModule({
      imports: [TenantSubscriptionComponent],
      providers: [{ provide: SettingsAdminService, useValue: mockSettings }],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the subscription and payment history', () => {
    expect(component.subscription?.planName).toBe('Pro');
    expect(component.payments.length).toBe(1);
  });

  it('renders exactly one row per payment (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.payments.length);
    expect(rows.length).toBe(1);
  });
});
