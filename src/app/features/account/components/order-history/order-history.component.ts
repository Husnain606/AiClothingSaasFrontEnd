import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { CartService } from '../../../cart/services/cart.service';
import { Order } from '../../models/account.model';
import { Router } from '@angular/router';
import { Product } from '../../../catalog/models/product.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  orders$!: Observable<Order[]>;
  selectedOrder?: Order;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  isReordering = false;

  private destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private accountState: AccountStateService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.hasError = false;

    this.accountService
      .getOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.accountState.setOrders(orders);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load orders:', err);
          this.hasError = true;
          this.errorMessage = 'Failed to load orders. Please try again later.';
          this.isLoading = false;
        },
      });

    this.orders$ = this.accountState.orders$;
  }

  onSelectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  onReorder(order: Order): void {
    this.isReordering = true;

    let reorderCount = 0;
    const itemsCount = order.items.length;

    order.items.forEach((item) => {
      // Create a product object for the cart service based on order item
      const product: Product = {
        id: item.productId,
        name: item.productName,
        slug: item.productName.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        categoryId: '',
        categoryName: '',
        basePrice: item.price,
        status: 'active',
        tags: [],
        variantCount: 0,
        primaryImageUrl: '',
        approvedReviewCount: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
      };

      this.cartService
        .addItem(product, item.quantity, item.variant)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            reorderCount++;
            if (reorderCount === itemsCount) {
              this.isReordering = false;
              this.router.navigate(['/cart']);
            }
          },
          error: (err) => {
            console.error('Failed to add item to cart:', err);
            this.isReordering = false;
          },
        });
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'bg-success';
      case 'shipped':
        return 'bg-info';
      case 'processing':
        return 'bg-warning';
      case 'pending':
        return 'bg-secondary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
