import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WishlistComponent } from './wishlist.component';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { CartService } from '../../../cart/services/cart.service';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { WishlistItem } from '../../models/account.model';

describe('WishlistComponent', () => {
  let component: WishlistComponent;
  let fixture: ComponentFixture<WishlistComponent>;
  let mockAccountService: Partial<AccountService>;
  let mockStateService: Partial<AccountStateService>;
  let mockCartService: Partial<CartService>;
  let mockRouter: Partial<Router>;

  const mockWishlistItems: WishlistItem[] = [
    {
      id: 'WISH-001',
      productId: 'PROD-001',
      productVariantId: null,
      productName: 'Jeans',
      productSlug: 'jeans',
      productBasePrice: 79.99,
      primaryImageUrl: 'https://example.com/jeans.jpg',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'WISH-002',
      productId: 'PROD-002',
      productVariantId: null,
      productName: 'Jacket',
      productSlug: null,
      productBasePrice: null,
      primaryImageUrl: 'https://example.com/jacket.jpg',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    mockAccountService = {
      getWishlist: vi.fn().mockReturnValue(of(mockWishlistItems)),
      removeFromWishlist: vi.fn().mockReturnValue(of(void 0)),
    };

    mockStateService = {
      setWishlist: vi.fn(),
      removeFromWishlist: vi.fn(),
      wishlist$: of(mockWishlistItems),
    };

    mockCartService = {
      addItem: vi.fn().mockReturnValue(of({})),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [WishlistComponent],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountStateService, useValue: mockStateService },
        { provide: CartService, useValue: mockCartService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should initialize with no error', () => {
      expect(component.hasError).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should call loadWishlist on init', () => {
      const spy = vi.spyOn(component as any, 'loadWishlist');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should fetch wishlist from service', () => {
      component.ngOnInit();
      expect(mockAccountService.getWishlist).toHaveBeenCalled();
    });

    it('should set loading to false after loading', () => {
      component.ngOnInit();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Load Wishlist', () => {
    it('should set loading state to true', () => {
      // Use a pending Subject so the loading state can be observed before the response
      const pending = new Subject<WishlistItem[]>();
      mockAccountService.getWishlist = vi.fn().mockReturnValue(pending.asObservable());

      component['loadWishlist']();
      expect(component.isLoading).toBe(true);

      pending.next(mockWishlistItems);
      pending.complete();
    });

    it('should handle wishlist load error', () => {
      mockAccountService.getWishlist = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
      component['loadWishlist']();

      expect(component.hasError).toBe(true);
    });

    it('should set wishlist$ observable', () => {
      component['loadWishlist']();
      expect(component.wishlistItems$).toBeDefined();
    });
  });

  describe('Add to Cart', () => {
    it('should set addingToCart flag', () => {
      // Use a pending Subject so the in-flight adding state can be observed
      const pending = new Subject<unknown>();
      mockCartService.addItem = vi.fn().mockReturnValue(pending.asObservable());

      const item = mockWishlistItems[0];
      component.onAddToCart(item);
      expect(component.addingToCart[item.id]).toBe(true);

      pending.next({});
      pending.complete();
    });

    it('should navigate to cart', () => {
      const item = mockWishlistItems[0];
      component.onAddToCart(item);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cart']);
    });
  });

  describe('Remove from Wishlist', () => {
    it('should call account service', () => { return new Promise<void>((resolve) => {
      const item = mockWishlistItems[0];
      component.onRemove(item);
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockAccountService.removeFromWishlist).toHaveBeenCalledWith(item.id);
        resolve();
      }, 100);
    }); });

    it('should update state service', () => { return new Promise<void>((resolve) => {
      const item = mockWishlistItems[0];
      component.onRemove(item);
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockStateService.removeFromWishlist).toHaveBeenCalledWith(item.id);
        resolve();
      }, 100);
    }); });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      const spy = vi.spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});
