import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutReviewComponent } from './checkout-review.component';
import { CheckoutForm, ShippingAddress } from '../../models/checkout.model';

describe('CheckoutReviewComponent', () => {
  let component: CheckoutReviewComponent;
  let fixture: ComponentFixture<CheckoutReviewComponent>;

  const mockCart = {
    items: [
      {
        productId: '1',
        productName: 'Test Product',
        price: 100,
        quantity: 2,
        selectedVariant: { size: 'M', color: 'Red' },
        imageUrl: 'test.jpg'
      }
    ],
    subtotal: 200,
    tax: 20,
    total: 220,
    itemCount: 2
  };

  const mockCheckoutForm: CheckoutForm = {
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    },
    paymentProof: {
      file: null,
      fileName: 'receipt.pdf'
    },
    termsAccepted: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutReviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutReviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cart', mockCart);
    fixture.componentRef.setInput('checkoutForm', mockCheckoutForm);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart items', () => {
    expect(component.cart.items.length).toBe(1);
    expect(component.cart.items[0].productName).toBe('Test Product');
  });

  it('should display checkout form shipping address', () => {
    expect(component.checkoutForm.shippingAddress.firstName).toBe('John');
    expect(component.checkoutForm.shippingAddress.city).toBe('New York');
  });

  it('should display payment proof filename', () => {
    expect(component.checkoutForm.paymentProof.fileName).toBe('receipt.pdf');
  });

  it('should display cart totals', () => {
    expect(component.cart.subtotal).toBe(200);
    expect(component.cart.tax).toBe(20);
    expect(component.cart.total).toBe(220);
  });

  it('should emit confirmed event on confirm', () => {
    let emitted = false;
    component.confirmed.subscribe(() => {
      emitted = true;
    });

    component.onConfirm();
    expect(emitted).toBe(true);
  });

  it('should disable button when submitting', () => {
    fixture.componentRef.setInput('isSubmitting', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});
