import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { OrderDetailComponent } from './order-detail.component';
import { OrderAdminService } from '../../shared/services/order-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { OrderDto } from '../../shared/models/order-admin.model';

describe('OrderDetailComponent', () => {
  let fixture: ComponentFixture<OrderDetailComponent>;
  let component: OrderDetailComponent;
  let mockOrderApi: Partial<OrderAdminService>;
  let mockToast: Partial<ToastService>;

  const baseOrder: OrderDto = {
    orderId: 'ORD-2026-000001', id: 'g1', customerId: 'c1', orderDate: '2026-07-01T00:00:00Z',
    status: 'pending', items: [], shippingAddress: {} as any, subtotal: 10, tax: 1, shippingCost: 0, total: 11,
  };

  function setup(order: OrderDto): void {
    mockOrderApi = {
      getOrder: vi.fn().mockReturnValue(of(order)),
      confirm: vi.fn().mockReturnValue(of({ ...order, status: 'confirmed' })),
      ship: vi.fn().mockReturnValue(of({ ...order, status: 'shipped', trackingNumber: 'T1' })),
      deliver: vi.fn().mockReturnValue(of({ ...order, status: 'delivered' })),
      cancel: vi.fn().mockReturnValue(of({ ...order, status: 'cancelled' })),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideRouter([]),
        { provide: OrderAdminService, useValue: mockOrderApi },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'g1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => setup(baseOrder));

  it('loads the order on init', () => {
    expect(mockOrderApi.getOrder).toHaveBeenCalledWith('g1');
    expect(component.order?.orderId).toBe('ORD-2026-000001');
  });

  it('exposes confirm and cancel as available actions for a pending order', () => {
    expect(component.actions).toEqual(['confirm', 'cancel']);
  });

  it('confirms the order and shows a success toast', () => {
    component.onConfirm();
    expect(mockOrderApi.confirm).toHaveBeenCalledWith('g1');
    expect(component.order?.status).toBe('confirmed');
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('opens the ship modal and ships with a tracking number typed inside the modal dialog', async () => {
    setup({ ...baseOrder, status: 'confirmed' });

    const shipBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-primary.btn-sm');
    shipBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();

    const reasonInput: HTMLInputElement | null = dialog.querySelector('#confirmReason');
    expect(reasonInput).toBeTruthy();
    expect(reasonInput).toBe(document.activeElement);

    reasonInput!.value = 'TRACK-1';
    reasonInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const confirmBtn: HTMLButtonElement = dialog.querySelector('[data-testid="confirm-btn"]')!;
    confirmBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockOrderApi.ship).toHaveBeenCalledWith('g1', 'TRACK-1');
    expect(component.shipModalOpen).toBe(false);
  });

  it('marks delivered', () => {
    component.onDeliver();
    expect(mockOrderApi.deliver).toHaveBeenCalledWith('g1');
  });

  it('opens the cancel modal and cancels with a reason typed inside the modal dialog', async () => {
    const cancelBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-outline-danger.btn-sm');
    cancelBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();

    const reasonInput: HTMLInputElement | null = dialog.querySelector('#confirmReason');
    expect(reasonInput).toBeTruthy();
    expect(reasonInput).toBe(document.activeElement);

    reasonInput!.value = 'Out of stock';
    reasonInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const confirmBtn: HTMLButtonElement = dialog.querySelector('[data-testid="confirm-btn"]')!;
    confirmBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockOrderApi.cancel).toHaveBeenCalledWith('g1', 'Out of stock');
    expect(component.cancelModalOpen).toBe(false);
  });

  it('shows an error toast when an action fails', () => {
    TestBed.resetTestingModule();
    mockOrderApi = {
      getOrder: vi.fn().mockReturnValue(of(baseOrder)),
      confirm: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideRouter([]),
        { provide: OrderAdminService, useValue: mockOrderApi },
        { provide: ToastService, useValue: mockToast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'g1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailComponent);
    fixture.detectChanges();
    fixture.componentInstance.onConfirm();
    expect(mockToast.error).toHaveBeenCalled();
  });
});
