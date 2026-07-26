import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccountStateService } from './account-state.service';
import { CustomerProfile, WishlistItem, Order } from '../models/account.model';

describe('AccountStateService', () => {
  let service: AccountStateService;

  const mockProfile: CustomerProfile = {
    userId: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    createdDate: new Date(),
    lastModifiedDate: new Date(),
  };

  const mockWishlistItems: WishlistItem[] = [
    {
      id: 'WISH-001',
      productId: 'PROD-001',
      productName: 'Jeans',
      price: 79.99,
      imageUrl: 'https://example.com/jeans.jpg',
      addedDate: new Date(),
      inStock: true,
    },
    {
      id: 'WISH-002',
      productId: 'PROD-002',
      productName: 'Jacket',
      price: 99.99,
      imageUrl: 'https://example.com/jacket.jpg',
      addedDate: new Date(),
      inStock: false,
    },
  ];

  const mockOrders: Order[] = [
    {
      orderId: 'ORD-001',
      id: 'guid-001',
      orderDate: new Date(),
      items: [],
      subtotal: 59.98,
      tax: 4.79,
      total: 64.77,
      status: 'delivered',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountStateService],
    });
    service = TestBed.inject(AccountStateService);
  });

  describe('Profile Management', () => {
    it('should set and get profile', () => {
      service.setProfile(mockProfile);
      const profile = service.getProfile();

      expect(profile).toEqual(mockProfile);
      expect(profile?.userId).toBe('123');
      expect(profile?.firstName).toBe('John');
    });

    it('should emit profile through observable', () => {
      return new Promise<void>((resolve) => {
        service.profile$.subscribe((profile) => {
          if (profile !== null) {
            expect(profile.userId).toBe('123');
            resolve();
          }
        });

        service.setProfile(mockProfile);
      });
    });

    it('should return null when no profile is set', () => {
      const profile = service.getProfile();
      expect(profile).toBeNull();
    });

    it('should update profile when set multiple times', () => {
      const updatedProfile = { ...mockProfile, firstName: 'Jane' };

      service.setProfile(mockProfile);
      expect(service.getProfile()?.firstName).toBe('John');

      service.setProfile(updatedProfile);
      expect(service.getProfile()?.firstName).toBe('Jane');
    });

    it('should replay last profile value to new subscribers', () => {
      return new Promise<void>((resolve) => {
        service.setProfile(mockProfile);

        service.profile$.subscribe(() => {
          expect(true).toBe(true);
        });

        service.profile$.subscribe((profile) => {
          expect(profile?.userId).toBe('123');
          resolve();
        });
      });
    });
  });

  describe('Wishlist Management', () => {
    it('should set and get wishlist items', () => {
      service.setWishlist(mockWishlistItems);
      const items = service.getWishlist();

      expect(items.length).toBe(2);
      expect(items[0].productName).toBe('Jeans');
      expect(items[1].productName).toBe('Jacket');
    });

    it('should emit wishlist through observable', () => {
      return new Promise<void>((resolve) => {
        let emissions = 0;

        service.wishlist$.subscribe((items) => {
          emissions++;
          if (emissions === 2) {
            expect(items.length).toBe(2);
            resolve();
          }
        });

        service.setWishlist(mockWishlistItems);
      });
    });

    it('should return empty array initially', () => {
      const items = service.getWishlist();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should replace wishlist when set multiple times', () => {
      service.setWishlist(mockWishlistItems);
      expect(service.getWishlist().length).toBe(2);

      service.setWishlist([mockWishlistItems[0]]);
      expect(service.getWishlist().length).toBe(1);
    });

    it('should add item to wishlist without duplicates', () => {
      service.setWishlist([mockWishlistItems[0]]);

      service.addToWishlist(mockWishlistItems[0]);
      expect(service.getWishlist().length).toBe(1);

      service.addToWishlist(mockWishlistItems[1]);
      expect(service.getWishlist().length).toBe(2);
    });

    it('should not add duplicate items to wishlist', () => {
      service.setWishlist([]);

      service.addToWishlist(mockWishlistItems[0]);
      expect(service.getWishlist().length).toBe(1);

      service.addToWishlist(mockWishlistItems[0]);
      expect(service.getWishlist().length).toBe(1);
    });

    it('should add item to wishlist via observable', () => {
      return new Promise<void>((resolve) => {
        let emissions = 0;

        service.wishlist$.subscribe((items) => {
          emissions++;
          if (emissions === 2 && items.length === 1) {
            expect(items[0].id).toBe('WISH-001');
            resolve();
          }
        });

        service.addToWishlist(mockWishlistItems[0]);
      });
    });

    it('should remove item from wishlist', () => {
      service.setWishlist(mockWishlistItems);
      expect(service.getWishlist().length).toBe(2);

      service.removeFromWishlist('WISH-001');
      expect(service.getWishlist().length).toBe(1);
      expect(service.getWishlist()[0].id).toBe('WISH-002');
    });

    it('should remove correct item from wishlist', () => {
      service.setWishlist(mockWishlistItems);

      service.removeFromWishlist('WISH-002');
      const items = service.getWishlist();

      expect(items.length).toBe(1);
      expect(items[0].productName).toBe('Jeans');
    });

    it('should handle removing non-existent item gracefully', () => {
      service.setWishlist(mockWishlistItems);

      service.removeFromWishlist('INVALID-ID');
      expect(service.getWishlist().length).toBe(2);
    });

    it('should emit wishlist updates after removal', () => {
      return new Promise<void>((resolve) => {
        let emissions = 0;

        const subscription = service.wishlist$.subscribe((items) => {
          emissions++;
          if (emissions === 1) {
            // First emission: initial empty state (BehaviorSubject replays current value)
            expect(items.length).toBe(0);
          } else if (emissions === 2) {
            // Second emission: initial set
            expect(items.length).toBe(2);
          } else if (emissions === 3) {
            // Third emission: after removal
            expect(items.length).toBe(1);
            expect(items[0].id).toBe('WISH-001');
            subscription.unsubscribe();
            resolve();
          }
        });

        service.setWishlist(mockWishlistItems);
        service.removeFromWishlist('WISH-002');
      });
    });
  });

  describe('Orders Management', () => {
    it('should set and get orders', () => {
      service.setOrders(mockOrders);
      const orders = service.getOrders();

      expect(orders.length).toBe(1);
      expect(orders[0].orderId).toBe('ORD-001');
      expect(orders[0].status).toBe('delivered');
    });

    it('should emit orders through observable', () => {
      return new Promise<void>((resolve) => {
        let emissions = 0;

        service.orders$.subscribe((orders) => {
          emissions++;
          if (emissions === 2) {
            expect(orders.length).toBe(1);
            resolve();
          }
        });

        service.setOrders(mockOrders);
      });
    });

    it('should return empty array initially', () => {
      const orders = service.getOrders();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBe(0);
    });

    it('should replace orders when set multiple times', () => {
      service.setOrders(mockOrders);
      expect(service.getOrders().length).toBe(1);

      const newOrders = [
        ...mockOrders,
        {
          ...mockOrders[0],
          orderId: 'ORD-002',
        },
      ];

      service.setOrders(newOrders);
      expect(service.getOrders().length).toBe(2);
    });
  });

  describe('State Management', () => {
    it('should clear all state', () => {
      service.setProfile(mockProfile);
      service.setWishlist(mockWishlistItems);
      service.setOrders(mockOrders);

      service.clearState();

      expect(service.getProfile()).toBeNull();
      expect(service.getWishlist()).toEqual([]);
      expect(service.getOrders()).toEqual([]);
    });

    it('should allow resetting state after clear', () => {
      service.setProfile(mockProfile);
      service.clearState();
      expect(service.getProfile()).toBeNull();

      service.setProfile(mockProfile);
      expect(service.getProfile()?.userId).toBe('123');
    });

    it('should maintain independent state for profile, wishlist, and orders', () => {
      service.setProfile(mockProfile);
      service.setWishlist(mockWishlistItems);
      service.setOrders(mockOrders);

      expect(service.getProfile()?.userId).toBe('123');
      expect(service.getWishlist().length).toBe(2);
      expect(service.getOrders().length).toBe(1);

      service.setProfile(null as any);
      expect(service.getWishlist().length).toBe(2);
      expect(service.getOrders().length).toBe(1);
    });
  });

  describe('Observable Replay', () => {
    it('should use shareReplay for profile', () => {
      service.setProfile(mockProfile);

      let emissionCount = 0;
      let sub1Emitted = false;
      let sub2Emitted = false;

      const subscription1 = service.profile$.subscribe((profile) => {
        if (profile !== null) {
          sub1Emitted = true;
          emissionCount++;
        }
      });

      const subscription2 = service.profile$.subscribe((profile) => {
        if (profile !== null) {
          sub2Emitted = true;
          emissionCount++;
        }
      });

      expect(emissionCount).toBe(2);
      expect(sub1Emitted).toBe(true);
      expect(sub2Emitted).toBe(true);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    });

    it('should use shareReplay for wishlist', () => {
      service.setWishlist(mockWishlistItems);

      let emissionCount = 0;

      const subscription1 = service.wishlist$.subscribe(() => {
        emissionCount++;
      });

      const subscription2 = service.wishlist$.subscribe(() => {
        emissionCount++;
      });

      expect(emissionCount).toBe(2);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    });

    it('should use shareReplay for orders', () => {
      service.setOrders(mockOrders);

      let emissionCount = 0;

      const subscription1 = service.orders$.subscribe(() => {
        emissionCount++;
      });

      const subscription2 = service.orders$.subscribe(() => {
        emissionCount++;
      });

      expect(emissionCount).toBe(2);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    });
  });
});
