import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { PlatformPaymentDto } from '../../models/platform.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-list.component.html',
})
export class PaymentListComponent {
  payments: PlatformPaymentDto[] = [];
  subscriptionId = '';
  noResultsFound = false;

  constructor(
    private platform: PlatformAdminService,
    private toast: ToastService
  ) {}

  onSubscriptionIdChange(subscriptionId: string): void {
    this.subscriptionId = subscriptionId;
    if (this.subscriptionId) {
      this.load();
    }
  }

  onConfirm(payment: PlatformPaymentDto): void {
    this.platform.confirmPayment(payment.id).subscribe({
      next: () => {
        this.toast.success('Payment confirmed.');
        this.load();
      },
      error: () => this.toast.error('Failed to confirm payment.'),
    });
  }

  private load(): void {
    this.platform.getPayments(this.subscriptionId).subscribe((payments) => {
      this.payments = payments;
      this.noResultsFound = payments.length === 0;
    });
  }
}
