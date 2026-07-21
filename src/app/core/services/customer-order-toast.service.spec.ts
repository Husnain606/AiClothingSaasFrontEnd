import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { CustomerOrderToastService } from './customer-order-toast.service';
import { NotificationHubService } from './notification-hub.service';
import { ToastService } from '../../admin/shared/services/toast.service';
import { AuthService } from './auth.service';
import { NotificationDto } from '../../admin/notifications/models/notification.model';

describe('CustomerOrderToastService', () => {
  let service: CustomerOrderToastService;
  let received: Subject<NotificationDto>;
  let mockHub: Partial<NotificationHubService>;
  let mockToast: Partial<ToastService>;
  let mockAuth: Partial<AuthService>;

  const orderStatusChanged: NotificationDto = {
    id: 'n1',
    type: 'OrderStatusChanged',
    title: 'Order ORD-1 Shipped',
    message: 'Order ORD-1 moved from Confirmed to Shipped.',
    entityName: 'Order',
    entityId: 'o1',
    isRead: false,
    createdAt: '2026-07-20T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    received = new Subject<NotificationDto>();
    mockHub = { connect: vi.fn(), notificationReceived$: received.asObservable() };
    mockToast = { info: vi.fn() };
    mockAuth = { getToken: vi.fn().mockReturnValue('jwt-token') };

    TestBed.configureTestingModule({
      providers: [
        { provide: NotificationHubService, useValue: mockHub },
        { provide: ToastService, useValue: mockToast },
        { provide: AuthService, useValue: mockAuth },
      ],
    });
    service = TestBed.inject(CustomerOrderToastService);
  });

  it('shows one toast on OrderStatusChanged for own user group only', () => {
    service.start();

    received.next(orderStatusChanged);

    expect(mockToast.info).toHaveBeenCalledTimes(1);
    expect(mockToast.info).toHaveBeenCalledWith(
      `${orderStatusChanged.title}: ${orderStatusChanged.message}`
    );
  });

  it('ignores non-OrderStatusChanged notifications', () => {
    service.start();

    received.next({ ...orderStatusChanged, id: 'n2', type: 'OrderPlaced' });

    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it('dedupes the same notification id if redelivered (defensive, e.g. reconnect)', () => {
    service.start();

    received.next(orderStatusChanged);
    received.next(orderStatusChanged);

    expect(mockToast.info).toHaveBeenCalledTimes(1);
  });

  it('does not connect the hub when unauthenticated', () => {
    (mockAuth.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

    service.start();

    expect(mockHub.connect).not.toHaveBeenCalled();
  });

  it('is idempotent — a second start() does not re-subscribe', () => {
    service.start();
    service.start();

    received.next(orderStatusChanged);

    expect(mockHub.connect).toHaveBeenCalledTimes(1);
    expect(mockToast.info).toHaveBeenCalledTimes(1);
  });
});
