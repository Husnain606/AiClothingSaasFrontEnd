import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CustomerProfile, WishlistItem, Order } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountStateService {
  private profileSubject = new BehaviorSubject<CustomerProfile | null>(null);
  profile$ = this.profileSubject.asObservable().pipe(shareReplay(1));

  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  wishlist$ = this.wishlistSubject.asObservable().pipe(shareReplay(1));

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable().pipe(shareReplay(1));

  constructor() {}

  /**
   * Set profile in state
   */
  setProfile(profile: CustomerProfile): void {
    this.profileSubject.next(profile);
  }

  /**
   * Get profile synchronously
   */
  getProfile(): CustomerProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Set wishlist items in state
   */
  setWishlist(items: WishlistItem[]): void {
    this.wishlistSubject.next(items);
  }

  /**
   * Get wishlist items synchronously
   */
  getWishlist(): WishlistItem[] {
    return this.wishlistSubject.value;
  }

  /**
   * Add item to wishlist state
   */
  addToWishlist(item: WishlistItem): void {
    const currentWishlist = this.wishlistSubject.value;
    const itemExists = currentWishlist.some((w) => w.id === item.id);
    if (!itemExists) {
      this.wishlistSubject.next([...currentWishlist, item]);
    }
  }

  /**
   * Remove item from wishlist state
   */
  removeFromWishlist(itemId: string): void {
    const currentWishlist = this.wishlistSubject.value;
    this.wishlistSubject.next(currentWishlist.filter((w) => w.id !== itemId));
  }

  /**
   * Set orders in state
   */
  setOrders(orders: Order[]): void {
    this.ordersSubject.next(orders);
  }

  /**
   * Get orders synchronously
   */
  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.profileSubject.next(null);
    this.wishlistSubject.next([]);
    this.ordersSubject.next([]);
  }
}
