import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderHistoryComponent } from './order-history.component';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { CartService } from '../../../cart/services/cart.service';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { Order } from '../../models/account.model';

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;
  let mockAccountService: Partial<AccountService>;
  let mockStateService: Partial<AccountStateService>;
  let mockCartService: Partial<CartService>;
  let mockRouter: Partial<Router>;

  const mockOrders: Order[] = [
    {
      orderId: 'ORD-001',
      id: 'guid-001',
      orderDate: new Date('2024-01-15'),
      items: [
        {
          productId: 'PROD-001',
          productName: 'T-Shirt',
          price: 29.99,
          quantity: 2,
          variant: { size: 'M', color: 'Blue' },
        },
      ],
      subtotal: 59.98,
      tax: 4.79,
      total: 64.77,
      status: 'delivered',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
    },
    {
      orderId: 'ORD-002',
      id: 'guid-002',
      orderDate: new Date('2024-01-10'),
      items: [
        {
          productId: 'PROD-002',
          productName: 'Jeans',
          price: 79.99,
          quantity: 1,
        },
      ],
      subtotal: 79.99,
      tax: 6.4,
      total: 86.39,
      status: 'shipped',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
    },
  ];

  beforeEach(async () => {
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockImplementation(() => null);

    mockAccountService = {
      getOrders: vi.fn().mockReturnValue(of(mockOrders)),
      getOrderPaymentProof: vi.fn().mockReturnValue(of(new Blob(['pdf-bytes'], { type: 'application/pdf' }))),
    };

    mockStateService = {
      setOrders: vi.fn(),
      orders$: of(mockOrders),
    };

    mockCartService = {
      addItem: vi.fn().mockReturnValue(of({})),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [OrderHistoryComponent],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountStateService, useValue: mockStateService },
        { provide: CartService, useValue: mockCartService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should initialize with no error', () => {
      expect(component.hasError).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should initialize reordering flag as false', () => {
      expect(component.isReordering).toBe(false);
    });

    it('should initialize selectedOrder as undefined', () => {
      expect(component.selectedOrder).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call loadOrders on init', () => {
      const spy = vi.spyOn(component as any, 'loadOrders');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should fetch orders from service', () => {
      component.ngOnInit();
      expect(mockAccountService.getOrders).toHaveBeenCalled();
    });

    it('should set loading to false after loading orders', () => {
      component.ngOnInit();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Load Orders', () => {
    it('should set loading state to true when loading', () => {
      // Use a pending Subject so the loading state can be observed before the response
      const pending = new Subject<Order[]>();
      mockAccountService.getOrders = vi.fn().mockReturnValue(pending.asObservable());

      component['loadOrders']();
      expect(component.isLoading).toBe(true);

      pending.next(mockOrders);
      pending.complete();
    });

    it('should clear error state when loading', () => {
      component.hasError = true;
      component.errorMessage = 'Previous error';

      component['loadOrders']();
      expect(component.hasError).toBe(false);
    });

    it('should set orders in state service', () => { return new Promise<void>((resolve) => {
      component['loadOrders']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockStateService.setOrders).toHaveBeenCalledWith(mockOrders);
        resolve();
      }, 100);
    }); });

    it('should set loading to false on success', () => { return new Promise<void>((resolve) => {
      component['loadOrders']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        resolve();
      }, 100);
    }); });

    it('should handle orders load error', () => {
      mockAccountService.getOrders = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('Network error')));

      component['loadOrders']();

      expect(component.hasError).toBe(true);
      expect(component.errorMessage).toContain('Failed to load orders');
      expect(component.isLoading).toBe(false);
    });

    it('should set orders$ observable from state service', () => {
      component['loadOrders']();

      expect(component.orders$).toBeDefined();
    });
  });

  describe('Order Selection', () => {
    it('should select order when onSelectOrder is called', () => {
      const order = mockOrders[0];
      component.onSelectOrder(order);

      expect(component.selectedOrder).toEqual(order);
    });

    it('should change selected order when different order is selected', () => {
      component.onSelectOrder(mockOrders[0]);
      expect(component.selectedOrder?.orderId).toBe('ORD-001');

      component.onSelectOrder(mockOrders[1]);
      expect(component.selectedOrder?.orderId).toBe('ORD-002');
    });

    it('should maintain order details in selectedOrder', () => {
      const order = mockOrders[0];
      component.onSelectOrder(order);

      expect(component.selectedOrder?.total).toBe(64.77);
      expect(component.selectedOrder?.status).toBe('delivered');
    });
  });

  describe('Payment Proof', () => {
    it('opens the proof blob in a new tab', () => {
      component.viewProof('ORD-001');

      expect(mockAccountService.getOrderPaymentProof).toHaveBeenCalledWith('ORD-001');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith('blob:mock', '_blank');
      expect(component.proofError()).toBe('');
    });

    it('sets proofError when the proof request fails', () => {
      mockAccountService.getOrderPaymentProof = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('404')));

      component.viewProof('ORD-001');

      expect(component.proofError()).toBe('Payment proof is unavailable.');
    });

    it('revokes any created proof object URLs on destroy', () => {
      component.viewProof('ORD-001');
      component.ngOnDestroy();

      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });
  });

  describe('Reorder Functionality', () => {
    it('should set reordering flag to true', () => {
      // Use a pending Subject so the in-flight reordering state can be observed
      const pending = new Subject<unknown>();
      mockCartService.addItem = vi.fn().mockReturnValue(pending.asObservable());

      component.isReordering = false;
      component.onReorder(mockOrders[0]);

      expect(component.isReordering).toBe(true);

      pending.next({});
      pending.complete();
    });

    it('should add all order items to cart', () => {
      component.onReorder(mockOrders[0]);

      expect(mockCartService.addItem).toHaveBeenCalled();
    });

    it('should navigate to cart after reorder', () => {
      component.onReorder(mockOrders[0]);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cart']);
    });

    it('should set reordering flag to false after completion', () => {
      component.onReorder(mockOrders[0]);

      expect(component.isReordering).toBe(false);
    });

    it('should handle error during reorder', () => {
      mockCartService.addItem = vi.fn().mockReturnValue(throwError(() => new Error('Cart error')));

      component.onReorder(mockOrders[0]);

      expect(component.isReordering).toBe(false);
    });

    it('should add item with correct quantity from order', () => {
      const order = mockOrders[0];
      component.onReorder(order);

      expect(mockCartService.addItem).toHaveBeenCalled();
      const callArgs = (mockCartService.addItem as any).mock.calls[0];
      expect(callArgs[1]).toBe(2); // quantity
    });

    it('should add item with variant from order', () => {
      const order = mockOrders[0];
      component.onReorder(order);

      expect(mockCartService.addItem).toHaveBeenCalled();
      const callArgs = (mockCartService.addItem as any).mock.calls[0];
      expect(callArgs[2]).toEqual({ size: 'M', color: 'Blue' }); // variant
    });

    it('should handle multiple items in order', () => {
      const multiItemOrder: Order = {
        ...mockOrders[0],
        items: [
          { productId: 'PROD-001', productName: 'T-Shirt', price: 29.99, quantity: 1 },
          { productId: 'PROD-002', productName: 'Jeans', price: 79.99, quantity: 1 },
          { productId: 'PROD-003', productName: 'Jacket', price: 99.99, quantity: 1 },
        ],
      };

      component.onReorder(multiItemOrder);

      expect(mockCartService.addItem).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cart']);
    });
  });

  describe('Status Badge Styling', () => {
    it('should return correct class for delivered status', () => {
      const badgeClass = component.getStatusBadgeClass('delivered');
      expect(badgeClass).toBe('bg-success');
    });

    it('should return correct class for shipped status', () => {
      const badgeClass = component.getStatusBadgeClass('shipped');
      expect(badgeClass).toBe('bg-info');
    });

    it('should return correct class for processing status', () => {
      const badgeClass = component.getStatusBadgeClass('processing');
      expect(badgeClass).toBe('bg-warning');
    });

    it('should return correct class for pending status', () => {
      const badgeClass = component.getStatusBadgeClass('pending');
      expect(badgeClass).toBe('bg-secondary');
    });

    it('should return correct class for cancelled status', () => {
      const badgeClass = component.getStatusBadgeClass('cancelled');
      expect(badgeClass).toBe('bg-danger');
    });

    it('should return default class for unknown status', () => {
      const badgeClass = component.getStatusBadgeClass('unknown');
      expect(badgeClass).toBe('bg-secondary');
    });
  });

  describe('Observable Integration', () => {
    it('should have orders$ observable', () => {
      component['loadOrders']();
      expect(component.orders$).toBeDefined();
    });

    it('should emit orders through orders$ observable', () => {
      component['loadOrders']();

      let emitted = false;
      component.orders$.subscribe((orders) => {
        if (!emitted) {
          expect(orders.length).toBe(2);
          expect(orders[0].orderId).toBe('ORD-001');
          emitted = true;
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should log error when order load fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAccountService.getOrders = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('API error')));

      component['loadOrders']();
      fixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should display user-friendly error message', () => { return new Promise<void>((resolve) => {
      mockAccountService.getOrders = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('API error')));

      component['loadOrders']();
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.errorMessage).toContain('Failed to load orders');
        resolve();
      }, 100);
    }); });

    it('should log reorder errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCartService.addItem = vi.fn().mockReturnValue(throwError(() => new Error('Cart error')));

      component.onReorder(mockOrders[0]);
      fixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe from observables on destroy', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should complete destroy subject on destroy', () => {
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
