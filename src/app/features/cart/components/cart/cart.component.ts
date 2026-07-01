import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { CartListComponent } from '../cart-list/cart-list.component';
import { CartSummaryComponent } from '../cart-summary/cart-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartListComponent, CartSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  cart$!: Observable<Cart>;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cart$ = this.cartService.getCart();
  }

  onRemoveItem(productId: string): void {
    this.cartService
      .removeItem(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onUpdateQuantity(productId: string, newQuantity: number): void {
    this.cartService
      .updateQuantity(productId, newQuantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onClearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService
        .clearCart()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  onCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
