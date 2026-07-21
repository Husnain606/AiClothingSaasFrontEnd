import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { NotificationBellComponent } from './notification-bell.component';
import { NotificationsAdminService } from '../services/notifications-admin.service';
import { NotificationHubService } from '../../../core/services/notification-hub.service';
import { ToastService } from '../../shared/services/toast.service';
import { NotificationDto } from '../models/notification.model';

describe('NotificationBellComponent', () => {
  let fixture: ComponentFixture<NotificationBellComponent>;
  let component: NotificationBellComponent;
  let mockNotifications: Partial<NotificationsAdminService>;
  let mockHub: Partial<NotificationHubService> & { received: Subject<NotificationDto> };
  let mockToast: Partial<ToastService>;

  const notification: NotificationDto = {
    id: 'n1',
    type: 'OrderPlaced',
    title: 'New order ORD-1',
    message: 'Order ORD-1 placed for $10.00.',
    entityName: 'Order',
    entityId: 'o1',
    isRead: false,
    createdAt: '2026-07-20T00:00:00Z',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    const received = new Subject<NotificationDto>();
    mockNotifications = {
      getUnreadCount: vi.fn().mockReturnValue(of(5)),
      getPaged: vi.fn().mockReturnValue(
        of({ items: [notification], totalCount: 1, page: 1, pageSize: 20, totalPages: 1 })
      ),
      markAllRead: vi.fn().mockReturnValue(of(undefined)),
    };
    mockHub = {
      connect: vi.fn(),
      notificationReceived$: received.asObservable(),
      received,
    };
    mockToast = { info: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: NotificationsAdminService, useValue: mockNotifications },
        { provide: NotificationHubService, useValue: mockHub },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders unread badge count from getUnreadCount()', () => {
    expect(mockNotifications.getUnreadCount).toHaveBeenCalled();
    expect(component.unreadCount).toBe(5);
  });

  it('marks read on dropdown open', () => {
    component.toggle();

    expect(mockNotifications.getPaged).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    expect(mockNotifications.markAllRead).toHaveBeenCalled();
    expect(component.unreadCount).toBe(0);
    expect(component.notifications).toEqual([notification]);
  });

  it('shows toast on live ReceiveNotification event', () => {
    mockHub.received.next(notification);

    expect(mockToast.info).toHaveBeenCalledWith(notification.title);
    expect(component.unreadCount).toBe(6);
  });
});
