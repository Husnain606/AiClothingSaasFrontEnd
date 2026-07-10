import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PlanListComponent } from './plan-list.component';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SubscriptionPlanDto } from '../../models/platform.model';

describe('PlanListComponent', () => {
  let fixture: ComponentFixture<PlanListComponent>;
  let component: PlanListComponent;
  let mockPlatform: Partial<PlatformAdminService>;
  let mockToast: Partial<ToastService>;

  const plan: SubscriptionPlanDto = {
    id: 'p1',
    planType: 'Monthly',
    name: 'Pro',
    price: 99,
    durationDays: 30,
    trialDays: 0,
    productLimit: 100,
    userLimit: 10,
    aiUsageLimit: 1000,
    storageLimitMb: 5000,
    isActive: true,
  };
  const plan2: SubscriptionPlanDto = { ...plan, id: 'p2', name: 'Enterprise', price: 299 };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getPlans: vi.fn().mockReturnValue(of([plan, plan2])),
      createPlan: vi.fn().mockReturnValue(of(plan)),
      deletePlan: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PlanListComponent, FormsModule],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }, { provide: ToastService, useValue: mockToast }],
    }).compileComponents();
    fixture = TestBed.createComponent(PlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads plans on init', () => {
    expect(component.plans.length).toBe(2);
  });

  it('renders exactly one row per plan (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.plans.length);
    expect(rows.length).toBe(2);
  });

  it('creates a plan', () => {
    const submitted = { planType: 'Monthly' as const, name: 'Basic', price: 29, durationDays: 30, trialDays: 0, productLimit: 10, userLimit: 2, aiUsageLimit: 100, storageLimitMb: 500 };
    component.newPlan = { ...submitted };
    component.onCreate();
    expect(mockPlatform.createPlan).toHaveBeenCalledWith(submitted);
  });

  it('deletes a plan', () => {
    component.onDelete(plan);
    expect(mockPlatform.deletePlan).toHaveBeenCalledWith('p1');
  });
});
