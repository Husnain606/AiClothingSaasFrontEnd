import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CartService } from './cart.service';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../../catalog/models/product.model';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 'prod1',
    name: 'Leather Jacket',
    slug: 'leather-jacket',
    description: 'Premium leather jacket',
    categoryId: 'cat1',
    categoryName: 'Clothing',
    basePrice: 79.99,
    status: 'active',
    tags: 'jacket,leather',
    variantCount: 2,
    primaryImageUrl: 'https://example.com/jacket.jpg',
    approvedReviewCount: 10,
    averageRating: 4.8,
    createdAt: '2024-01-01',
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    service = new CartService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should load empty cart from storage initially', () => {
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.tax).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should expose cart$ observable', () => {
      const cart$ = service.getCart();
      expect(cart$).toBeTruthy();
    });
  });

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      service.addItem(mockProduct, 2).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].productId).toBe(mockProduct.id);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.itemCount).toBe(2);
    });

    it('should increment quantity if item exists', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.addItem(mockProduct, 2).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.itemCount).toBe(3);
    });

    it('should handle items with different variants', () => {
      const variant1 = { size: 'M', color: 'Red' };
      const variant2 = { size: 'L', color: 'Blue' };

      service.addItem(mockProduct, 1, variant1).subscribe();
      service.addItem(mockProduct, 1, variant2).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(2);
      expect(cart.itemCount).toBe(2);
    });

    it('should persist cart to localStorage', () => {
      service.addItem(mockProduct, 1).subscribe();
      const stored = localStorage.getItem('fashion-cart');
      expect(stored).toBeTruthy();
      const cart = JSON.parse(stored!);
      expect(cart.items.length).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.removeItem(mockProduct.id).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(0);
      expect(cart.itemCount).toBe(0);
    });

    it('should persist removal to localStorage', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.removeItem(mockProduct.id).subscribe();
      const stored = localStorage.getItem('fashion-cart');
      const cart = JSON.parse(stored!);
      expect(cart.items.length).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.updateQuantity(mockProduct.id, 5).subscribe();
      const cart = service.getCartValue();
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.itemCount).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.updateQuantity(mockProduct.id, 0).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(0);
      expect(cart.itemCount).toBe(0);
    });

    it('should remove item if quantity is negative', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.updateQuantity(mockProduct.id, -1).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items', () => {
      service.addItem(mockProduct, 1).subscribe();
      service.clearCart().subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.tax).toBe(0);
      expect(cart.total).toBe(0);
    });
  });

  describe('totals calculation', () => {
    it('should calculate subtotal correctly', () => {
      service.addItem(mockProduct, 2).subscribe();
      const cart = service.getCartValue();
      const expectedSubtotal = 79.99 * 2;
      expect(cart.subtotal).toBe(expectedSubtotal);
    });

    it('should calculate tax as 10% of subtotal', () => {
      service.addItem(mockProduct, 2).subscribe();
      const cart = service.getCartValue();
      const expectedSubtotal = 79.99 * 2;
      const expectedTax = parseFloat((expectedSubtotal * 0.1).toFixed(2));
      expect(cart.tax).toBe(expectedTax);
    });

    it('should calculate total as subtotal + tax', () => {
      service.addItem(mockProduct, 2).subscribe();
      const cart = service.getCartValue();
      const expectedSubtotal = 79.99 * 2;
      const expectedTax = parseFloat((expectedSubtotal * 0.1).toFixed(2));
      const expectedTotal = parseFloat((expectedSubtotal + expectedTax).toFixed(2));
      expect(cart.total).toBe(expectedTotal);
    });

    it('should handle multiple items in cart', () => {
      const product2: Product = {
        ...mockProduct,
        id: 'prod2',
        basePrice: 50.0,
      };

      service.addItem(mockProduct, 1).subscribe();
      service.addItem(product2, 1).subscribe();
      const cart = service.getCartValue();
      const expectedSubtotal = 79.99 + 50.0;
      const expectedTax = parseFloat((expectedSubtotal * 0.1).toFixed(2));
      const expectedTotal = parseFloat((expectedSubtotal + expectedTax).toFixed(2));

      expect(cart.subtotal).toBe(expectedSubtotal);
      expect(cart.tax).toBe(expectedTax);
      expect(cart.total).toBe(expectedTotal);
      expect(cart.itemCount).toBe(2);
    });
  });

  describe('persistence', () => {
    it('should load cart from localStorage on init', () => {
      const mockCart: Cart = {
        items: [
          {
            productId: 'prod1',
            productName: 'Test Product',
            price: 99.99,
            quantity: 2,
            selectedVariant: { size: 'M' },
            imageUrl: 'https://example.com/test.jpg',
          },
        ],
        subtotal: 199.98,
        tax: 19.998,
        total: 219.978,
        itemCount: 2,
      };

      localStorage.setItem('fashion-cart', JSON.stringify(mockCart));
      const newService = new CartService();

      expect(newService.getCartValue().items.length).toBe(1);
      expect(newService.getCartValue().itemCount).toBe(2);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('fashion-cart', 'invalid json');
      expect(() => {
        const newService = new CartService();
        expect(newService.getCartValue().items.length).toBe(0);
      }).not.toThrow();
    });
  });

  describe('getCartValue', () => {
    it('should return current cart synchronously', () => {
      service.addItem(mockProduct, 1).subscribe();
      const cart = service.getCartValue();
      expect(cart.items.length).toBe(1);
      expect(cart.itemCount).toBe(1);
    });
  });
});
