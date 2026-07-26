import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderAdminService } from '../../shared/services/order-admin.service';
import { OrderDto } from '../../shared/models/order-admin.model';
import { availableActions } from '../order-status.utils';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: OrderDto | null = null;
  actions: ReturnType<typeof availableActions> = [];
  shipModalOpen = false;
  cancelModalOpen = false;

  // Signals, not plain fields: this app runs zoneless change detection
  // (provideZonelessChangeDetection in app.config.ts). A plain field mutated inside
  // an RxJS subscribe callback that resolves after the initial render (as this proof
  // fetch does) would never trigger a re-render — only signal writes (or an
  // async-piped Observable) do. Same lesson Task 7 documented for payment-form.component.ts.
  proofUrl = signal<string | null>(null);
  proofIsPdf = signal(false);
  proofError = signal('');

  constructor(
    private route: ActivatedRoute,
    private orderApi: OrderAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderApi.getOrder(id).subscribe((order) => {
      this.applyOrder(order);
      // Only fetch the proof once, on initial load - not on every subsequent
      // confirm/ship/deliver/cancel transition, which also route through applyOrder.
      this.loadPaymentProof(order.id);
    });
  }

  loadPaymentProof(orderId: string): void {
    this.proofError.set('');
    this.orderApi.getPaymentProof(orderId).subscribe({
      next: (blob) => {
        this.proofIsPdf.set(blob.type === 'application/pdf');
        // Object URL is revoked in ngOnDestroy to avoid leaking the blob.
        this.proofUrl.set(URL.createObjectURL(blob));
      },
      error: () => this.proofError.set('No payment proof available for this order.')
    });
  }

  ngOnDestroy(): void {
    const url = this.proofUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  private applyOrder(order: OrderDto): void {
    this.order = order;
    this.actions = availableActions(order.status);
  }

  onConfirm(): void {
    if (!this.order) return;
    this.orderApi.confirm(this.order.id).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.toast.success('Order confirmed.');
      },
      error: () => this.toast.error('Failed to confirm order.'),
    });
  }

  openShipModal(): void {
    this.shipModalOpen = true;
  }

  onShipCancelled(): void {
    this.shipModalOpen = false;
  }

  onShipConfirmed(trackingNumber: string | undefined): void {
    if (!this.order) return;
    this.orderApi.ship(this.order.id, trackingNumber || undefined).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.shipModalOpen = false;
        this.toast.success('Order shipped.');
      },
      error: () => {
        this.shipModalOpen = false;
        this.toast.error('Failed to ship order.');
      },
    });
  }

  onDeliver(): void {
    if (!this.order) return;
    this.orderApi.deliver(this.order.id).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.toast.success('Order marked delivered.');
      },
      error: () => this.toast.error('Failed to update order.'),
    });
  }

  openCancelModal(): void {
    this.cancelModalOpen = true;
  }

  onCancelCancelled(): void {
    this.cancelModalOpen = false;
  }

  onCancelConfirmed(reason: string | undefined): void {
    if (!this.order) return;
    this.orderApi.cancel(this.order.id, reason ?? '').subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.cancelModalOpen = false;
        this.toast.success('Order cancelled.');
      },
      error: () => {
        this.cancelModalOpen = false;
        this.toast.error('Failed to cancel order.');
      },
    });
  }
}
