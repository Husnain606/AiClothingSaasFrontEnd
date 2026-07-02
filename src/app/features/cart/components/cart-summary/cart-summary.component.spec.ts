import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartSummaryComponent } from './cart-summary.component';
import { Cart } from '../../models/cart.model';

describe('CartSummaryComponent', () => {
  let component: CartSummaryComponent;
  let fixture: ComponentFixture<CartSummaryComponent>;

  const mockCart: Cart = {
    items: [
      {
        productId: 'prod1',
        productName: 'Leather Jacket',
        price: 79.99,
        quantity: 2,
        selectedVariant: { size: 'M' },
        imageUrl: 'https://example.com/jacket.jpg',
      },
    ],
    subtotal: 159.98,
    tax: 15.998,
    total: 175.978,
    itemCount: 2,
  };

  const emptyCart: Cart = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cart', mockCart);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('display', () => {
    it('should display subtotal', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('159.98');
    });

    it('should display tax', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Tax (10%)');
    });

    it('should display total', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('175.98');
    });

    it('should display order summary title', () => {
      const title = fixture.nativeElement.querySelector('.card-title');
      expect(title.textContent).toContain('Order Summary');
    });
  });

  describe('buttons', () => {
    it('should have checkout button enabled when cart has items', () => {
      fixture.componentRef.setInput('cart', mockCart);
      fixture.detectChanges();

      const checkoutButton = fixture.nativeElement.querySelector('button:first-of-type');
      expect(checkoutButton.disabled).toBe(false);
    });

    it('should disable checkout button when cart is empty', () => {
      fixture.componentRef.setInput('cart', emptyCart);
      fixture.detectChanges();

      const checkoutButton = fixture.nativeElement.querySelector('button:first-of-type');
      expect(checkoutButton.disabled).toBe(true);
    });

    it('should disable clear button when cart is empty', () => {
      fixture.componentRef.setInput('cart', emptyCart);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const clearButton = buttons[1];
      expect(clearButton.disabled).toBe(true);
    });

    it('should have clear button enabled when cart has items', () => {
      fixture.componentRef.setInput('cart', mockCart);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const clearButton = buttons[1];
      expect(clearButton.disabled).toBe(false);
    });
  });

  describe('events', () => {
    it('should emit checkout event when checkout button clicked', () => {
      const spy = vi.spyOn(component.checkout, 'emit');
      component.onCheckout();

      expect(spy).toHaveBeenCalled();
    });

    it('should emit clearCart event when clear button clicked', () => {
      const spy = vi.spyOn(component.clearCart, 'emit');
      component.onClear();

      expect(spy).toHaveBeenCalled();
    });
  });
});
