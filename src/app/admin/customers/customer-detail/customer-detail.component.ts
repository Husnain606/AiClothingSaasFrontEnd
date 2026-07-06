import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CustomerAdminService } from '../services/customer-admin.service';
import { OrderAdminService } from '../../shared/services/order-admin.service';
import { CustomerDto, WishlistItemDto } from '../models/customer-admin.model';
import { OrderDto } from '../../shared/models/order-admin.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, ConfirmModalComponent],
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit {
  customer: CustomerDto | null = null;
  orders: OrderDto[] = [];
  wishlist: WishlistItemDto[] = [];
  deactivateModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private customers: CustomerAdminService,
    private orderApi: OrderAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.customers.getCustomer(id).subscribe((customer) => (this.customer = customer));
    this.orderApi.getOrders({ customerId: id, page: 1, pageSize: 20 }).subscribe((result) => (this.orders = result.items));
    this.customers.getWishlist(id).subscribe((wishlist) => (this.wishlist = wishlist.items));
  }

  openDeactivateModal(): void {
    this.deactivateModalOpen = true;
  }

  onDeactivateCancelled(): void {
    this.deactivateModalOpen = false;
  }

  onDeactivateConfirmed(): void {
    if (!this.customer) return;
    this.customers.deactivateCustomer(this.customer.id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.deactivateModalOpen = false;
        this.toast.success('Customer deactivated.');
      },
      error: () => {
        this.deactivateModalOpen = false;
        this.toast.error('Failed to deactivate customer.');
      },
    });
  }
}
