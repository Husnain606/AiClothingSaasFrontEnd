import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CustomerDetailComponent } from './customer-detail.component';
import { CustomerAdminService } from '../services/customer-admin.service';
import { OrderAdminService } from '../../shared/services/order-admin.service';
import { ToastService } from '../../shared/services/toast.service';

describe('CustomerDetailComponent', () => {
  let fixture: ComponentFixture<CustomerDetailComponent>;
  let component: CustomerDetailComponent;
  let mockCustomers: Partial<CustomerAdminService>;
  let mockOrders: Partial<OrderAdminService>;
  let mockToast: Partial<ToastService>;

  const customer = { id: 'c1', email: 'a@b.com', firstName: 'A', lastName: 'B', isActive: true, createdAt: '2026-01-01' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockCustomers = {
      getCustomer: vi.fn().mockReturnValue(of(customer)),
      deactivateCustomer: vi.fn().mockReturnValue(of({ ...customer, isActive: false })),
      getWishlist: vi.fn().mockReturnValue(of({ id: 'w1', customerId: 'c1', items: [] })),
    };
    mockOrders = {
      getOrders: vi.fn().mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 })),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CustomerDetailComponent],
      providers: [
        { provide: CustomerAdminService, useValue: mockCustomers },
        { provide: OrderAdminService, useValue: mockOrders },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'c1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the customer, their orders, and wishlist', () => {
    expect(mockCustomers.getCustomer).toHaveBeenCalledWith('c1');
    expect(mockOrders.getOrders).toHaveBeenCalledWith(expect.objectContaining({ customerId: 'c1' }));
    expect(mockCustomers.getWishlist).toHaveBeenCalledWith('c1');
  });

  it('opens the deactivate confirm modal', () => {
    component.openDeactivateModal();
    expect(component.deactivateModalOpen).toBe(true);
  });

  it('deactivates the customer on confirm', () => {
    component.openDeactivateModal();
    component.onDeactivateConfirmed();
    expect(mockCustomers.deactivateCustomer).toHaveBeenCalledWith('c1');
    expect(mockToast.success).toHaveBeenCalled();
    expect(component.deactivateModalOpen).toBe(false);
  });

  it('closes the modal on cancel without deactivating', () => {
    component.openDeactivateModal();
    component.onDeactivateCancelled();
    expect(component.deactivateModalOpen).toBe(false);
    expect(mockCustomers.deactivateCustomer).not.toHaveBeenCalled();
  });
});
