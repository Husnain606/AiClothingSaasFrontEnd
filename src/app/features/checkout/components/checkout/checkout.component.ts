import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject, forkJoin } from 'rxjs';
import { take, takeUntil, switchMap } from 'rxjs/operators';
import { CartService } from '../../../cart/services/cart.service';
import { Cart } from '../../../cart/models/cart.model';
import { CartItem } from '../../../cart/models/cart.model';
import { CheckoutService } from '../../services/checkout.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CheckoutForm, ShippingAddress, PaymentInfo } from '../../models/checkout.model';
import { Order } from '../../models/order.model';
import { ShippingFormComponent } from '../shipping-form/shipping-form.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { CheckoutReviewComponent } from '../checkout-review/checkout-review.component';
import { OrderConfirmationComponent } from '../order-confirmation/order-confirmation.component';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ShippingFormComponent,
    PaymentFormComponent,
    CheckoutReviewComponent,
    OrderConfirmationComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart$!: Observable<Cart>;
  checkoutForm$!: Observable<CheckoutForm>;
  currentStep: CheckoutStep = 'shipping';
  isSubmitting = false;
  orderConfirmation?: Order;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cart$ = this.cartService.getCart();
    this.checkoutForm$ = this.checkoutService.checkoutForm$;
  }

  onShippingSubmit(shippingAddress: ShippingAddress) {
    const currentForm = this.checkoutService.getCheckoutForm();
    this.checkoutService.setCheckoutForm({
      ...currentForm,
      shippingAddress
    });
    this.currentStep = 'payment';
  }

  onPaymentSubmit(paymentInfo: PaymentInfo) {
    const currentForm = this.checkoutService.getCheckoutForm();
    this.checkoutService.setCheckoutForm({
      ...currentForm,
      paymentInfo
    });
    this.currentStep = 'review';
  }

  onReviewConfirm() {
    this.isSubmitting = true;

    forkJoin({
      cart: this.cartService.getCart().pipe(take(1)),
      form: this.checkoutService.checkoutForm$.pipe(take(1))
    })
      .pipe(
        switchMap(({ cart, form }) =>
          this.orderService.createOrder(form, cart.items)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (order) => {
          this.orderConfirmation = order;
          this.currentStep = 'confirmation';
          this.cartService.clearCart().subscribe();
        },
        error: (err) => {
          console.error('Order creation failed:', err);
          alert('Order creation failed. Please try again.');
          this.isSubmitting = false;
        }
      });
  }

  onContinueShopping() {
    this.router.navigate(['/products']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
