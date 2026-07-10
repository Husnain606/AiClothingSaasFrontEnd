import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { OrderListComponent } from './order-list.component';
import { OrderAdminService } from '../../shared/services/order-admin.service';
import { OrderDto } from '../../shared/models/order-admin.model';

describe('OrderListComponent', () => {
  let fixture: ComponentFixture<OrderListComponent>;
  let component: OrderListComponent;
  let mockOrderApi: Partial<OrderAdminService>;

  const orders: OrderDto[] = [
    {
      orderId: 'ORD-2026-000001', id: 'g1', customerId: 'c1', orderDate: '2026-07-01T00:00:00Z',
      status: 'pending', items: [], shippingAddress: {} as any, subtotal: 10, tax: 1, shippingCost: 0, total: 11,
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockOrderApi = {
      getOrders: vi.fn().mockReturnValue(of({ items: orders, totalCount: 1, page: 1, pageSize: 20, totalPages: 1 })),
    };

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [provideRouter([]), { provide: OrderAdminService, useValue: mockOrderApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the first page of orders on init', () => {
    expect(mockOrderApi.getOrders).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));
    expect(component.rows.length).toBe(1);
    expect(component.totalCount).toBe(1);
  });

  it('re-queries when the status filter changes', () => {
    (mockOrderApi.getOrders as ReturnType<typeof vi.fn>).mockClear();
    component.onStatusFilterChange('confirmed');
    expect(mockOrderApi.getOrders).toHaveBeenCalledWith(expect.objectContaining({ status: 'confirmed', page: 1 }));
  });

  it('re-queries when the search term changes', () => {
    (mockOrderApi.getOrders as ReturnType<typeof vi.fn>).mockClear();
    component.onSearchChange('ORD-2026');
    expect(mockOrderApi.getOrders).toHaveBeenCalledWith(expect.objectContaining({ search: 'ORD-2026', page: 1 }));
  });

  it('re-queries when the date range changes', () => {
    (mockOrderApi.getOrders as ReturnType<typeof vi.fn>).mockClear();
    component.onRangeChange({ from: '2026-06-01', to: '2026-07-01' });
    expect(mockOrderApi.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ from: '2026-06-01', to: '2026-07-01', page: 1 })
    );
  });

  it('changes page on pageChange event', () => {
    (mockOrderApi.getOrders as ReturnType<typeof vi.fn>).mockClear();
    component.onPageChange(2);
    expect(mockOrderApi.getOrders).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('navigates to order detail on row select', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onRowSelect(0);
    expect(navSpy).toHaveBeenCalledWith(['/admin/orders', 'g1']);
  });
});
