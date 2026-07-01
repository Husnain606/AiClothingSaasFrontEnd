import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cart } from '../../models/cart.model';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
})
export class CartSummaryComponent {
  @Input() cart!: Cart;
  @Output() clearCart = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();

  onClear(): void {
    this.clearCart.emit();
  }

  onCheckout(): void {
    this.checkout.emit();
  }
}
