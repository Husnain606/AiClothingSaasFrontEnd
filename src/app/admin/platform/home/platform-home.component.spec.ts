import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformHomeComponent } from './platform-home.component';
import { PlatformAdminService } from '../services/platform-admin.service';

describe('PlatformHomeComponent', () => {
  let fixture: ComponentFixture<PlatformHomeComponent>;
  let component: PlatformHomeComponent;
  let mockPlatform: Partial<PlatformAdminService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockPlatform = {
      getTenants: vi.fn().mockReturnValue(of({ items: [], totalCount: 12, pageNumber: 1, pageSize: 1, totalPages: 12 })),
      getSubscriptions: vi.fn().mockReturnValue(
        of([{ id: 's1', tenantId: 't1', planName: 'Pro', status: 'Active', startDate: '2026-01-01', endDate: '2027-01-01', price: 99 }])
      ),
      getPlatformUsers: vi.fn().mockReturnValue(
        of([{ id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'x@y.com', tenantId: null, isActive: true, roles: ['SuperAdmin'], createdAt: '2026-01-01' }])
      ),
    };

    await TestBed.configureTestingModule({
      imports: [PlatformHomeComponent],
      providers: [{ provide: PlatformAdminService, useValue: mockPlatform }],
    }).compileComponents();
    fixture = TestBed.createComponent(PlatformHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('assembles tenant, subscription, and user counts client-side', () => {
    expect(component.tenantCount).toBe(12);
    expect(component.activeSubscriptionCount).toBe(1);
    expect(component.platformUserCount).toBe(1);
  });
});
