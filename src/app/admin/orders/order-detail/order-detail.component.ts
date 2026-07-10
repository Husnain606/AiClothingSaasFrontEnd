import { Component, OnInit } from '@angular/core';
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
export class OrderDetailComponent implements OnInit {
  order: OrderDto | null = null;
  actions: ReturnType<typeof availableActions> = [];
  shipModalOpen = false;
  cancelModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private orderApi: OrderAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderApi.getOrder(id).subscribe((order) => this.applyOrder(order));
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
