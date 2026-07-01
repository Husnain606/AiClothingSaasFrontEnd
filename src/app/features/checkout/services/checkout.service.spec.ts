import { TestBed } from '@angular/core/testing';
import { CheckoutService } from './checkout.service';
import { CheckoutForm, ShippingAddress, PaymentInfo } from '../models/checkout.model';

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutService]
    });
    service = TestBed.inject(CheckoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    const form = service.getCheckoutForm();
    expect(form.shippingAddress.firstName).toBe('');
    expect(form.paymentInfo.cardNumber).toBe('');
  });

  it('should set and get checkout form', () => {
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

    const checkoutForm: CheckoutForm = {
      shippingAddress,
      paymentInfo: {
        cardholderName: 'John Doe',
        cardNumber: '****1111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: ''
      },
      termsAccepted: true
    };

    service.setCheckoutForm(checkoutForm);
    const retrievedForm = service.getCheckoutForm();

    expect(retrievedForm.shippingAddress.firstName).toBe('John');
    expect(retrievedForm.paymentInfo.cardNumber).toBe('****1111');
  });

  it('should emit form changes via observable', () => {
    const shippingAddress: ShippingAddress = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1-555-0456',
      street: '456 Oak Ave',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'US'
    };

    const checkoutForm: CheckoutForm = {
      shippingAddress,
      paymentInfo: {
        cardholderName: 'Jane Smith',
        cardNumber: '****2222',
        expiryMonth: '06',
        expiryYear: '2026',
        cvv: ''
      }
    };

    let emissionCount = 0;
    service.checkoutForm$.subscribe((form) => {
      if (form.shippingAddress.firstName === 'Jane') {
        emissionCount++;
      }
    });

    service.setCheckoutForm(checkoutForm);
    expect(emissionCount).toBeGreaterThan(0);
  });

  it('should maintain form state across multiple updates', () => {
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

    const form1: CheckoutForm = {
      shippingAddress,
      paymentInfo: {
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      }
    };

    service.setCheckoutForm(form1);

    const paymentInfo: PaymentInfo = {
      cardholderName: 'John Doe',
      cardNumber: '****1111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: ''
    };

    const form2: CheckoutForm = {
      shippingAddress,
      paymentInfo
    };

    service.setCheckoutForm(form2);

    const finalForm = service.getCheckoutForm();
    expect(finalForm.shippingAddress.firstName).toBe('John');
    expect(finalForm.paymentInfo.cardNumber).toBe('****1111');
  });
});
