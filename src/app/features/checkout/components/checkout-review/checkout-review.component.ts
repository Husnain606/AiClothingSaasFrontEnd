import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutForm } from '../../models/checkout.model';

// We need to import from the correct path
interface CartCompat {
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedVariant: {
      size?: string;
      color?: string;
    };
  }>;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

@Component({
  selector: 'app-checkout-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-review.component.html',
  styleUrls: ['./checkout-review.component.scss']
})
export class CheckoutReviewComponent {
  @Input() cart!: CartCompat;
  @Input() checkoutForm!: CheckoutForm;
  @Input() isSubmitting = false;
  @Output() confirmed = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }
}
