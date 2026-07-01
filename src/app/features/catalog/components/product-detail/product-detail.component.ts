import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product, ProductVariant } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product$ = new BehaviorSubject<Product | null>(null);
  variants$ = new BehaviorSubject<ProductVariant[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // UI State
  selectedVariant$ = new BehaviorSubject<ProductVariant | null>(null);
  quantity = new FormControl(1);
  currentImageIndex = 0;

  private destroy$ = new Subject<void>();
  private productId: string = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.productId = params['id'];
          this.loading$.next(true);
          this.error$.next(null);
          return this.productService.getProductById(this.productId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (product) => {
          this.product$.next(product);
          this.loading$.next(false);
          this.loadVariants();
        },
        error: (err) => {
          console.error('Failed to load product:', err);
          this.error$.next('Failed to load product. Please try again.');
          this.loading$.next(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load product variants
   */
  private loadVariants(): void {
    this.productService
      .getProductVariants(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (variants) => {
          this.variants$.next(variants);
          if (variants.length > 0) {
            this.selectedVariant$.next(variants[0]);
          }
        },
        error: (err) => {
          console.error('Failed to load variants:', err);
          this.error$.next('Failed to load product variants.');
        },
      });
  }

  /**
   * Select a product variant
   */
  selectVariant(variant: ProductVariant): void {
    this.selectedVariant$.next(variant);
  }

  /**
   * Navigate to previous image
   */
  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  /**
   * Navigate to next image
   */
  nextImage(): void {
    this.currentImageIndex++;
  }

  /**
   * Go to specific image
   */
  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  /**
   * Add product to cart
   */
  addToCart(): void {
    const product = this.product$.value;
    const variant = this.selectedVariant$.value;
    const qty = this.quantity.value || 1;

    if (!product) {
      this.error$.next('Product not found');
      return;
    }

    if (product.variantCount > 0 && !variant) {
      this.error$.next('Please select a variant');
      return;
    }

    console.log('Adding to cart:', {
      product: product.id,
      variant: variant?.id,
      quantity: qty,
    });

    // TODO: Connect to CartService in Task 4
    alert(
      `${qty} x ${product.name}${variant ? ` (${variant.color}, ${variant.size})` : ''} added to cart!`
    );
  }

  /**
   * Go back to catalog
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Format price
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  /**
   * Get star array for rating
   */
  getStarArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= roundedRating);
    }
    return stars;
  }

  /**
   * Get unique values from variants (for filters)
   */
  getUniqueSizes(): string[] {
    return Array.from(new Set(this.variants$.value.map((v) => v.size)));
  }

  getUniqueColors(): string[] {
    return Array.from(new Set(this.variants$.value.map((v) => v.color)));
  }

  /**
   * Filter variants by selected filters
   */
  getVariantsBySizeAndColor(size?: string, color?: string): ProductVariant[] {
    let filtered = this.variants$.value;
    if (size) {
      filtered = filtered.filter((v) => v.size === size);
    }
    if (color) {
      filtered = filtered.filter((v) => v.color === color);
    }
    return filtered;
  }
}
