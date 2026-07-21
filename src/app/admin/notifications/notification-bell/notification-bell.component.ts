import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationsAdminService } from '../services/notifications-admin.service';
import { NotificationHubService } from '../../../core/services/notification-hub.service';
import { ToastService } from '../../shared/services/toast.service';
import { NotificationDto } from '../models/notification.model';

const DROPDOWN_PAGE_SIZE = 20;

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  isOpen = false;
  notifications: NotificationDto[] = [];
  loading = false;

  private hubSub?: Subscription;

  constructor(
    private notificationsService: NotificationsAdminService,
    private hub: NotificationHubService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refreshUnreadCount();

    this.hub.connect();
    this.hubSub = this.hub.notificationReceived$.subscribe((notification) => {
      this.unreadCount += 1;
      this.toastService.info(notification.title);
      if (this.isOpen) {
        this.notifications = [notification, ...this.notifications];
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.hubSub?.unsubscribe();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.openAndMarkRead();
    }
  }

  close(): void {
    this.isOpen = false;
  }

  private refreshUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe((count) => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    });
  }

  private openAndMarkRead(): void {
    this.loading = true;
    this.notificationsService.getPaged({ page: 1, pageSize: DROPDOWN_PAGE_SIZE }).subscribe({
      next: (page) => {
        this.notifications = page.items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    // Mark-read-on-open: opening the dropdown is the user's acknowledgement of everything
    // currently unread, so clear the badge immediately rather than waiting on a per-item click.
    this.notificationsService.markAllRead().subscribe(() => {
      this.unreadCount = 0;
      this.cdr.markForCheck();
    });
  }
}
