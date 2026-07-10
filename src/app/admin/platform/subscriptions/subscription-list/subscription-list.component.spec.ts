import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SubscriptionListComponent } from './subscription-list.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PlatformSubscriptionDto } from '../../models/platform.model';

describe('SubscriptionListComponent', () => {
  let fixture: ComponentFixture<SubscriptionListComponent>;
  let component: SubscriptionListComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  const sub: PlatformSubscriptionDto = {
    id: 's1',
    tenantId: 't1',
    planName: 'Pro',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    price: 99,
  };
  const sub2: PlatformSubscriptionDto = { ...sub, id: 's2', tenantId: 't2', status: 'Suspended' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getSubscriptions: vi.fn().mockReturnValue(of([sub, sub2])),
      getPlans: vi.fn().mockReturnValue(of([{ id: 'p2', planType: 'Monthly', name: 'Enterprise', price: 199, durationDays: 30, trialDays: 0, productLimit: 500, userLimit: 50, aiUsageLimit: 5000, storageLimitMb: 50000, isActive: true }])),
      changeSubscriptionPlan: vi.fn().mockReturnValue(of({ ...sub, planName: 'Enterprise' })),
      suspendSubscription: vi.fn().mockReturnValue(of({ ...sub, status: 'Suspended' })),
      reactivateSubscription: vi.fn().mockReturnValue(of(sub)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SubscriptionListComponent, FormsModule],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }, { provide: ToastService, useValue: mockToast }],
    }).compileComponents();
    fixture = TestBed.createComponent(SubscriptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads subscriptions and plans on init', () => {
    expect(component.subscriptions.length).toBe(2);
    expect(component.plans.length).toBe(1);
  });

  it('renders exactly one row per subscription (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.subscriptions.length);
    expect(rows.length).toBe(2);
  });

  it('changes a subscription plan', () => {
    component.onChangePlan(sub, 'p2');
    expect(mockPlatform.changeSubscriptionPlan).toHaveBeenCalledWith('s1', 'p2');
  });

  it('suspends a subscription', () => {
    component.onSuspend(sub);
    expect(mockPlatform.suspendSubscription).toHaveBeenCalledWith('s1');
  });

  it('reactivates a subscription', () => {
    component.onReactivate(sub2);
    expect(mockPlatform.reactivateSubscription).toHaveBeenCalledWith('s2');
  });
});
