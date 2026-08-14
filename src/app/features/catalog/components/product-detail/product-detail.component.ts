import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product, ProductVariant } from '../../models/product.model';
import { CartService } from '../../../cart/services/cart.service';
import { TryOnService } from '../../services/try-on.service';
import { MeasurementService } from '../../services/measurement.service';
import { MeasurementResult } from '../../models/measurement.model';
import { ChatContextService } from '../../../chat/services/chat-context.service';
import { NotificationHubService } from '../../../../core/services/notification-hub.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationDto } from '../../../../admin/notifications/models/notification.model';

// Matches the backend measurement validator's photo cap (MeasurementRequestFormValidator).
const MAX_MEASUREMENT_PHOTO_BYTES = 10 * 1024 * 1024;

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

  // Try It On state (still stateless — nothing persisted beyond this instance). The render is
  // now asynchronous: submit returns immediately and `tryOnProcessing$` stays true until the
  // SignalR push for `tryOnRequestId` arrives (see onTryOnNotification).
  tryOnPhotoFile: File | null = null;
  tryOnRequestId: string | null = null;
  tryOnResultImageUrl$ = new BehaviorSubject<string | null>(null);
  tryOnProcessing$ = new BehaviorSubject<boolean>(false);
  tryOnError$ = new BehaviorSubject<string | null>(null);

  // Find My Size state (design spec §12 — mirrors Try It On's stateless pattern)
  measurementPhotoFile: File | null = null;
  measurementHeightCm = new FormControl<number | null>(null);
  measurementResult$ = new BehaviorSubject<MeasurementResult | null>(null);
  measurementLoading$ = new BehaviorSubject<boolean>(false);
  measurementError$ = new BehaviorSubject<string | null>(null);

  private destroy$ = new Subject<void>();
  private productId: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private tryOnService: TryOnService,
    private measurementService: MeasurementService,
    private chatContextService: ChatContextService,
    private notificationHub: NotificationHubService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // The try-on result arrives as a notification push, not as the submit response. connect() is
    // idempotent, so calling it here is safe even if another part of the app already did - but it
    // is gated on being signed in: this is a PUBLIC product page, and the hub requires a JWT, so an
    // anonymous visitor would otherwise open a socket that can only fail and log noise. Try It On
    // itself requires auth, so an anonymous visitor has nothing to receive.
    if (this.authService.getToken()) {
      this.notificationHub.connect();
    }
    this.notificationHub.notificationReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => this.onTryOnNotification(notification));

    this.route.params
      .pipe(
        switchMap((params) => {
          this.productId = params['id'];
          // Angular reuses this component across /product/:id changes, so ngOnInit does NOT run
          // again. Without this reset, navigating to another product carries the previous
          // product's try-on state over - including a spinner for a render that no longer
          // describes what is on screen.
          this.resetTryOnState();
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
    this.chatContextService.clearContext();
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
          this.publishChatContext();
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

    this.cartService
      .addItem(product, qty, variant ? { size: variant.size, color: variant.color } : undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/cart']);
        },
        error: (err) => {
          console.error('Failed to add to cart:', err);
          this.error$.next('Failed to add item to cart. Please try again.');
        },
      });
  }

  /**
   * Try It On — spec §8 (fully stateless): the uploaded photo and rendered result
   * exist only in this component's memory for the current view. Nothing is sent
   * anywhere except the try-on service's single request/response.
   */
  /** Drops any in-flight or finished render, so a late push can't resurrect a result. */
  private resetTryOnState(): void {
    this.tryOnPhotoFile = null;
    this.tryOnRequestId = null;
    this.tryOnProcessing$.next(false);
    this.tryOnError$.next(null);
    this.tryOnResultImageUrl$.next(null);
  }

  onTryOnPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tryOnPhotoFile = input.files?.[0] ?? null;
    this.tryOnRequestId = null; // drop any earlier render, so a late push can't resurrect its result
    this.tryOnError$.next(null);
    this.tryOnResultImageUrl$.next(null);
  }

  submitTryOn(): void {
    const product = this.product$.value;
    const variant = this.selectedVariant$.value;

    if (!this.tryOnPhotoFile) {
      this.tryOnError$.next('Please choose a photo first.');
      return;
    }
    if (!product?.primaryImageUrl) {
      this.tryOnError$.next('This product has no image to try on.');
      return;
    }

    this.tryOnProcessing$.next(true);
    this.tryOnError$.next(null);
    this.tryOnResultImageUrl$.next(null);

    this.tryOnService
      .submit(this.tryOnPhotoFile, product.primaryImageUrl, this.productId, variant?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submitted) => {
          // Deliberately does NOT clear tryOnProcessing$ — the render has only been queued.
          // onTryOnNotification resolves it when the result push arrives.
          this.tryOnRequestId = submitted.requestId;
        },
        error: (err) => {
          this.tryOnProcessing$.next(false);
          const status = err?.status;
          this.tryOnError$.next(
            status === 429
              ? "You've reached this month's try-on limit. Upgrade your plan or try again next month."
              : 'The try-on render failed. Please try again in a moment.'
          );
        },
      });
  }

  /**
   * Resolves the processing state when this component's own try-on finishes. The push carries
   * only "something happened" — the actual result URL / failure reason comes from a follow-up
   * GET, so the shared NotificationDto shape doesn't need a try-on-specific payload field.
   */
  private onTryOnNotification(notification: NotificationDto): void {
    const requestId = this.tryOnRequestId;
    if (!requestId || notification.entityId !== requestId) {
      return;
    }
    if (notification.type !== 'TryOnCompleted' && notification.type !== 'TryOnFailed') {
      return;
    }

    this.tryOnService
      .getStatus(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          // Consume the id: Service Bus is at-least-once and the consumer has no idempotency
          // guard, so the same push can arrive twice. Without this, a redelivery would re-fetch
          // and re-render this result over whatever the user has since moved on to.
          this.tryOnRequestId = null;
          this.tryOnProcessing$.next(false);
          if (status.status === 'Completed' && status.resultImageUrl) {
            this.tryOnResultImageUrl$.next(status.resultImageUrl);
          } else {
            this.tryOnError$.next(
              status.failureReason ?? 'The try-on render failed. Please try again in a moment.'
            );
          }
        },
        error: () => {
          this.tryOnProcessing$.next(false);
          this.tryOnError$.next('The try-on render failed. Please try again in a moment.');
        },
      });
  }

  /**
   * Find My Size — same stateless rule as Try It On: the uploaded photo exists only in
   * this component's memory; only the single /api/measure request/response leaves it.
   */
  onMeasurementPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.measurementResult$.next(null);
    if (file && file.size > MAX_MEASUREMENT_PHOTO_BYTES) {
      this.measurementPhotoFile = null;
      this.measurementError$.next('Photo must be 10 MB or smaller. Please choose a smaller image.');
      return;
    }
    this.measurementPhotoFile = file;
    this.measurementError$.next(null);
  }

  submitMeasurement(): void {
    if (!this.measurementPhotoFile) {
      this.measurementError$.next('Please choose a photo first.');
      return;
    }

    this.measurementLoading$.next(true);
    this.measurementError$.next(null);
    this.measurementResult$.next(null);

    this.measurementService
      .estimate(this.measurementPhotoFile, this.measurementHeightCm.value ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.measurementLoading$.next(false);
          this.measurementResult$.next(result);
        },
        error: (err) => {
          this.measurementLoading$.next(false);
          const status = err?.status;
          this.measurementError$.next(
            status === 429
              ? "You've reached this month's AI usage limit. Upgrade your plan or try again next month."
              : 'The measurement estimate failed. Please try again in a moment.'
          );
        },
      });
  }

  isRecommendedSize(size: string): boolean {
    return this.measurementResult$.value?.recommendedSize?.toUpperCase() === size.toUpperCase();
  }

  /**
   * Publish the loaded product (name/description/sizes) as the chat widget's product
   * context (Phase 6 §F5 — shared ChatContextService; cleared again in ngOnDestroy).
   */
  private publishChatContext(): void {
    const product = this.product$.value;
    if (!product) {
      return;
    }
    this.chatContextService.setContext({
      name: product.name,
      description: product.description,
      sizes: this.getUniqueSizes(),
    });
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
   * Tags come from the API as a single comma-separated string (ProductResponse.Tags),
   * not an array — split for display here rather than changing the wire contract.
   */
  getTagList(tags: string | null | undefined): string[] {
    return tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];
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
