import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CartComponent } from './cart.component';
import { CartService } from '../../services/cart.service';
import { of } from 'rxjs';
import { Cart } from '../../models/cart.model';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let mockCartService: Partial<CartService>;
  let mockRouter: Partial<Router>;

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

  beforeEach(async () => {
    mockCartService = {
      getCart: vi.fn().mockReturnValue(of(mockCart)),
      removeItem: vi.fn().mockReturnValue(of(mockCart)),
      updateQuantity: vi.fn().mockReturnValue(of(mockCart)),
      clearCart: vi.fn().mockReturnValue(of({ items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 })),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load cart on init', () => {
      component.ngOnInit();

      expect(mockCartService.getCart).toHaveBeenCalled();
      expect(component.cart$).toBeTruthy();
    });
  });

  describe('remove item', () => {
    it('should call cartService.removeItem', () => {
      component.onRemoveItem('prod1');

      expect(mockCartService.removeItem).toHaveBeenCalledWith('prod1');
    });
  });

  describe('update quantity', () => {
    it('should call cartService.updateQuantity', () => {
      component.onUpdateQuantity('prod1', 5);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith('prod1', 5);
    });
  });

  describe('clear cart', () => {
    it('should show confirmation dialog', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.onClearCart();

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should call cartService.clearCart if confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.onClearCart();

      expect(mockCartService.clearCart).toHaveBeenCalled();
    });

    it('should not call cartService.clearCart if not confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.onClearCart();

      expect(mockCartService.clearCart).not.toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should navigate to checkout', () => {
      component.onCheckout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout']);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on destroy', () => {
      const destroyCompleteSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroyCompleteSpy).toHaveBeenCalled();
    });
  });
});
