import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { DiscountListComponent } from './discount-list.component';
import { DiscountAdminService } from '../services/discount-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { DiscountDto } from '../models/discount-admin.model';

describe('DiscountListComponent', () => {
  let fixture: ComponentFixture<DiscountListComponent>;
  let component: DiscountListComponent;
  let mockDiscounts: Partial<DiscountAdminService>;
  let mockToast: Partial<ToastService>;

  const discount: DiscountDto = {
    id: 'd1',
    code: 'SAVE10',
    type: 'Percentage',
    value: 10,
    redemptionCount: 0,
    isActive: true,
    startsAt: '2026-07-01',
    endsAt: '2026-08-01',
    createdAt: '2026-06-01',
  };

  const discount2: DiscountDto = {
    id: 'd2',
    code: 'SAVE20',
    type: 'FixedAmount',
    value: 20,
    redemptionCount: 1,
    isActive: false,
    startsAt: '2026-07-05',
    endsAt: '2026-09-01',
    createdAt: '2026-06-02',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockDiscounts = {
      getDiscounts: vi
        .fn()
        .mockReturnValue(of({ items: [discount, discount2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })),
      deactivateDiscount: vi.fn().mockReturnValue(of(true)),
      deleteDiscount: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DiscountListComponent],
      providers: [
        provideRouter([]),
        { provide: DiscountAdminService, useValue: mockDiscounts },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DiscountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads discounts on init', () => {
    expect(component.rows.length).toBe(2);
  });

  it('renders exactly one row per discount (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(component.rows.length);
    expect(rows.length).toBe(2);
  });

  it('deactivates a discount', () => {
    component.onDeactivate(discount);
    expect(mockDiscounts.deactivateDiscount).toHaveBeenCalledWith('d1');
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('opens the delete modal and deletes on confirm', () => {
    component.openDeleteModal(discount);
    expect(component.deleteModalOpen).toBe(true);
    component.onDeleteConfirmed();
    expect(mockDiscounts.deleteDiscount).toHaveBeenCalledWith('d1');
    expect(component.deleteModalOpen).toBe(false);
  });

  it('cancels the delete modal without deleting', () => {
    component.openDeleteModal(discount);
    component.onDeleteCancelled();
    expect(component.deleteModalOpen).toBe(false);
    expect(mockDiscounts.deleteDiscount).not.toHaveBeenCalled();
  });
});
