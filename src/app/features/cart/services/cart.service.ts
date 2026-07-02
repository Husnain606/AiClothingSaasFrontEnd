import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../../catalog/models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'fashion-cart';
  private cartSubject = new BehaviorSubject<Cart>(this.loadFromStorage());
  cart$ = this.cartSubject.asObservable().pipe(shareReplay(1));

  constructor() {}

  /**
   * Add item to cart
   * If item exists, increment quantity
   */
  addItem(product: Product, quantity: number, variant?: { size?: string; color?: string }): Observable<Cart> {
    const cart = this.cartSubject.value;
    const existingItem = cart.items.find(
      (item) => item.productId === product.id && this.variantsMatch(item.selectedVariant, variant)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        price: product.basePrice,
        quantity,
        selectedVariant: variant || { size: undefined, color: undefined },
        imageUrl: product.primaryImageUrl,
      };
      cart.items.push(newItem);
    }

    const updatedCart = this.recalculateTotals(cart);
    this.saveToStorage(updatedCart);
    this.cartSubject.next(updatedCart);

    return this.cart$;
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: string): Observable<Cart> {
    const cart = this.cartSubject.value;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    const updatedCart = this.recalculateTotals(cart);
    this.saveToStorage(updatedCart);
    this.cartSubject.next(updatedCart);

    return this.cart$;
  }

  /**
   * Update item quantity
   * If quantity is 0, remove the item
   */
  updateQuantity(productId: string, newQuantity: number): Observable<Cart> {
    const cart = this.cartSubject.value;

    if (newQuantity <= 0) {
      return this.removeItem(productId);
    }

    const item = cart.items.find((item) => item.productId === productId);
    if (item) {
      item.quantity = newQuantity;
    }

    const updatedCart = this.recalculateTotals(cart);
    this.saveToStorage(updatedCart);
    this.cartSubject.next(updatedCart);

    return this.cart$;
  }

  /**
   * Clear all items from cart
   */
  clearCart(): Observable<Cart> {
    const emptyCart: Cart = {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    };

    this.saveToStorage(emptyCart);
    this.cartSubject.next(emptyCart);

    return this.cart$;
  }

  /**
   * Get current cart observable
   */
  getCart(): Observable<Cart> {
    return this.cart$;
  }

  /**
   * Get current cart value synchronously
   */
  getCartValue(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Recalculate cart totals
   */
  private recalculateTotals(cart: Cart): Cart {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cart,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      total,
      itemCount,
    };
  }

  /**
   * Save cart to localStorage
   */
  private saveToStorage(cart: Cart): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  /**
   * Load cart from localStorage
   */
  private loadFromStorage(): Cart {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
    return { items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 };
  }

  /**
   * Check if two variants match
   */
  private variantsMatch(variant1?: { size?: string; color?: string }, variant2?: { size?: string; color?: string }): boolean {
    // Treat a missing variant and an empty variant ({ size: undefined, color: undefined })
    // as equivalent, so adding the same variant-less product twice increments quantity
    // instead of creating a duplicate line item.
    return variant1?.size === variant2?.size && variant1?.color === variant2?.color;
  }
}
