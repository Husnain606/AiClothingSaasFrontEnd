import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { cartNotEmptyGuard } from './cart-not-empty.guard';
import { CartService } from '../services/cart.service';
import { Cart } from '../models/cart.model';

describe('cartNotEmptyGuard', () => {
  let cartService: Partial<CartService>;
  let router: Partial<Router>;

  const cartWithItems: Cart = {
    items: [
      {
        productId: 'prod1',
        productName: 'Test Product',
        price: 99.99,
        quantity: 1,
        selectedVariant: {},
        imageUrl: 'https://example.com/test.jpg',
      },
    ],
    subtotal: 99.99,
    tax: 9.999,
    total: 109.989,
    itemCount: 1,
  };

  const emptyCart: Cart = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  };

  beforeEach(() => {
    cartService = {
      getCartValue: vi.fn().mockReturnValue(cartWithItems),
    };

    router = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartService },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow navigation if cart has items', () => {
    const result = TestBed.runInInjectionContext(() =>
      cartNotEmptyGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('should prevent navigation if cart is empty', () => {
    (cartService.getCartValue as any).mockReturnValue(emptyCart);

    const result = TestBed.runInInjectionContext(() =>
      cartNotEmptyGuard({} as any, {} as any)
    );

    expect(result).toBe(false);
  });

  it('should redirect to products if cart is empty', () => {
    (cartService.getCartValue as any).mockReturnValue(emptyCart);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    TestBed.runInInjectionContext(() =>
      cartNotEmptyGuard({} as any, {} as any)
    );

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should show alert if cart is empty', () => {
    (cartService.getCartValue as any).mockReturnValue(emptyCart);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    TestBed.runInInjectionContext(() =>
      cartNotEmptyGuard({} as any, {} as any)
    );

    expect(alertSpy).toHaveBeenCalled();
  });

  it('should not redirect if cart has items', () => {
    TestBed.runInInjectionContext(() =>
      cartNotEmptyGuard({} as any, {} as any)
    );

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
