import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../../cart/services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ShippingAddress, PaymentInfo } from '../../models/checkout.model';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [CartService, CheckoutService, OrderService, AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at shipping step', () => {
    expect(component.currentStep).toBe('shipping');
  });

  it('should move to payment step on shipping submit', () => {
    const shippingAddress: ShippingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    };

    component.onShippingSubmit(shippingAddress);
    expect(component.currentStep).toBe('payment');
  });

  it('should move to review step on payment submit', () => {
    component.currentStep = 'payment';

    const paymentInfo: PaymentInfo = {
      cardholderName: 'John Doe',
      cardNumber: '****1111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: ''
    };

    component.onPaymentSubmit(paymentInfo);
    expect(component.currentStep).toBe('review');
  });

  it('should be able to navigate', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onContinueShopping();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });
});
