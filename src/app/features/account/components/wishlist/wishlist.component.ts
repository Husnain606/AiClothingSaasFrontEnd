import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { AccountStateService } from '../../services/account-state.service';
import { CartService } from '../../../cart/services/cart.service';
import { WishlistItem } from '../../models/account.model';
import { Router } from '@angular/router';
import { Product } from '../../../catalog/models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems$!: Observable<WishlistItem[]>;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  addingToCart: { [key: string]: boolean } = {};
  removing: { [key: string]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private accountState: AccountStateService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    this.isLoading = true;
    this.hasError = false;

    this.accountService
      .getWishlist()
      .pipe(
        tap((items) => {
          this.accountState.setWishlist(items);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load wishlist:', err);
          this.hasError = true;
          this.errorMessage = 'Failed to load wishlist. Please try again later.';
          this.isLoading = false;
        },
      });

    this.wishlistItems$ = this.accountState.wishlist$;
  }

  onAddToCart(item: WishlistItem): void {
    this.addingToCart[item.id] = true;

    const product: Product = {
      id: item.productId,
      name: item.productName,
      slug: item.productName.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      categoryId: '',
      categoryName: '',
      basePrice: item.price,
      status: 'active',
      tags: [],
      variantCount: 0,
      primaryImageUrl: item.imageUrl,
      approvedReviewCount: 0,
      averageRating: 0,
      createdAt: new Date().toISOString(),
    };

    this.cartService
      .addItem(product, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addingToCart[item.id] = false;
          this.router.navigate(['/cart']);
        },
        error: (err) => {
          console.error('Failed to add to cart:', err);
          this.addingToCart[item.id] = false;
        },
      });
  }

  onRemove(item: WishlistItem): void {
    this.removing[item.id] = true;

    this.accountService
      .removeFromWishlist(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.accountState.removeFromWishlist(item.id);
          this.removing[item.id] = false;
        },
        error: (err) => {
          console.error('Failed to remove from wishlist:', err);
          this.removing[item.id] = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
