import { Injectable } from '@angular/core';
import { NotificationHubService } from './notification-hub.service';
import { ToastService } from '../../admin/shared/services/toast.service';
import { AuthService } from './auth.service';

/**
 * Customer-facing counterpart to the admin bell (F5): no history UI, just a single ephemeral
 * toast per live `OrderStatusChanged` push for the signed-in customer's own orders. Persisted
 * rows still exist server-side (D2, persist-then-push) but this phase deliberately ships no
 * customer notification list (see plan §8, out of scope).
 */
@Injectable({ providedIn: 'root' })
export class CustomerOrderToastService {
  private started = false;
  private readonly shownNotificationIds = new Set<string>();

  constructor(
    private hub: NotificationHubService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  /** Idempotent — safe to call every time the main (customer) layout mounts. */
  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;

    if (!this.authService.getToken()) {
      // Not signed in — nothing to connect for; the hub requires an authenticated JWT anyway.
      return;
    }

    this.hub.connect();
    this.hub.notificationReceived$.subscribe((notification) => {
      if (notification.type !== 'OrderStatusChanged') {
        return;
      }

      // OrderStatusChangedNotificationHandler pushes the same notification to both the
      // tenant:{tenantId} group (staff) and the user:{customerId} group (this customer) — a
      // customer connection is a member of both, so it can receive the identical
      // notification id twice. Dedupe so the customer sees exactly one toast per event.
      if (this.shownNotificationIds.has(notification.id)) {
        return;
      }
      this.shownNotificationIds.add(notification.id);

      this.toastService.info(`${notification.title}: ${notification.message}`);
    });
  }
}
