import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../cart/services/cart.service';
import { TryOnService } from '../../services/try-on.service';
import { MeasurementService } from '../../services/measurement.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductVariant } from '../../models/product.model';
import { Cart } from '../../../cart/models/cart.model';
import { NotificationHubService } from '../../../../core/services/notification-hub.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationDto } from '../../../../admin/notifications/models/notification.model';
import { of, throwError, Subject, BehaviorSubject } from 'rxjs';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: Partial<ProductService>;
  let cartService: Partial<CartService>;
  let tryOnService: Partial<TryOnService>;
  let measurementService: Partial<MeasurementService>;
  let router: Partial<Router>;
  let activatedRoute: any;
  // Drives the try-on completion push; the real hub is a WebSocket we never open in a unit test.
  let notificationPushes: Subject<NotificationDto>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    categoryId: 'cat1',
    categoryName: 'Electronics',
    basePrice: 99.99,
    status: 'active',
    // Product.tags is a comma-separated string (matching ProductResponse.Tags), not an array —
    // this fixture predates that model change and blocked this spec file from compiling at all.
    tags: 'tag1',
    variantCount: 2,
    primaryImageUrl: 'image.jpg',
    approvedReviewCount: 5,
    averageRating: 4.5,
    createdAt: '2024-01-01',
  };

  const mockVariants: ProductVariant[] = [
    {
      id: 'var1',
      productId: '1',
      size: 'M',
      color: 'Red',
      sku: 'SKU123',
      stockQuantity: 10,
      priceOverride: null,
      effectivePrice: 99.99,
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'var2',
      productId: '1',
      size: 'L',
      color: 'Blue',
      sku: 'SKU124',
      stockQuantity: 5,
      priceOverride: null,
      effectivePrice: 99.99,
      isActive: true,
      createdAt: '2024-01-01',
    },
  ];

  const mockCart: Cart = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  };

  beforeEach(async () => {
    const productServiceMock = {
      getProductById: vi.fn(),
      getProductVariants: vi.fn(),
    } as unknown as Partial<ProductService>;
    const cartServiceMock = {
      addItem: vi.fn().mockReturnValue(of(mockCart)),
    } as unknown as Partial<CartService>;
    tryOnService = { submit: vi.fn(), getStatus: vi.fn() };
    measurementService = { estimate: vi.fn() };
    notificationPushes = new Subject<NotificationDto>();
    const notificationHubMock = {
      connect: vi.fn(),
      notificationReceived$: notificationPushes.asObservable(),
    } as unknown as Partial<NotificationHubService>;
    // Signed in by default: the hub connection is gated on a token, and the try-on tests below
    // exercise the push path, which only a signed-in customer can reach.
    const authServiceMock = {
      getToken: vi.fn().mockReturnValue('test-jwt'),
    } as unknown as Partial<AuthService>;
    const routerMock = {
      navigate: vi.fn(),
    } as unknown as Partial<Router>;

    // BehaviorSubject rather than of(): emits { id: '1' } immediately like before, but also lets a
    // test push a later param change to exercise component reuse across /product/:id.
    activatedRoute = {
      params: new BehaviorSubject<{ id: string }>({ id: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: TryOnService, useValue: tryOnService },
        { provide: MeasurementService, useValue: measurementService },
        { provide: NotificationHubService, useValue: notificationHubMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as unknown as Partial<ProductService>;
    cartService = TestBed.inject(CartService) as unknown as Partial<CartService>;
    tryOnService = TestBed.inject(TryOnService) as unknown as Partial<TryOnService>;
    measurementService = TestBed.inject(MeasurementService) as unknown as Partial<MeasurementService>;
    router = TestBed.inject(Router) as unknown as Partial<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));

    component.ngOnInit();

    expect(productService.getProductById).toHaveBeenCalledWith('1');
    expect(component.product$.value).toEqual(mockProduct);
  });

  it('should load variants after product loads', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));

    component.ngOnInit();

    expect(productService.getProductVariants).toHaveBeenCalledWith('1');
    expect(component.variants$.value).toEqual(mockVariants);
  });

  it('should select first variant by default', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));

    component.ngOnInit();

    expect(component.selectedVariant$.value).toEqual(mockVariants[0]);
  });

  it('should select a variant', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));

    component.ngOnInit();
    component.selectVariant(mockVariants[1]);

    expect(component.selectedVariant$.value).toEqual(mockVariants[1]);
  });

  it('should format price correctly', () => {
    const formatted = component.formatPrice(99.99);
    expect(formatted).toContain('99.99');
  });

  it('should get star array for rating', () => {
    // getStarArray rounds to the nearest whole star: 4.4 -> 4 filled stars
    const stars = component.getStarArray(4.4);
    expect(stars.length).toBe(5);
    expect(stars.filter((s) => s).length).toBe(4);
  });

  it('should get unique sizes from variants', () => {
    component.variants$.next(mockVariants);

    const sizes = component.getUniqueSizes();

    expect(sizes.length).toBe(2);
    expect(sizes).toContain('M');
    expect(sizes).toContain('L');
  });

  it('should get unique colors from variants', () => {
    component.variants$.next(mockVariants);

    const colors = component.getUniqueColors();

    expect(colors.length).toBe(2);
    expect(colors).toContain('Red');
    expect(colors).toContain('Blue');
  });

  it('should filter variants by size', () => {
    component.variants$.next(mockVariants);

    const filtered = component.getVariantsBySizeAndColor('M');

    expect(filtered.length).toBe(1);
    expect(filtered[0].size).toBe('M');
  });

  it('should filter variants by color', () => {
    component.variants$.next(mockVariants);

    const filtered = component.getVariantsBySizeAndColor(undefined, 'Red');

    expect(filtered.length).toBe(1);
    expect(filtered[0].color).toBe('Red');
  });

  it('should add to cart with product and variant', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));

    component.ngOnInit();
    component.quantity.setValue(2);
    component.addToCart();

    expect(cartService.addItem).toHaveBeenCalledWith(mockProduct, 2, {
      size: mockVariants[0].size,
      color: mockVariants[0].color,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('should add to cart without a variant when product has no variants', () => {
    const noVariantProduct: Product = { ...mockProduct, variantCount: 0 };
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(noVariantProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of([]));

    component.ngOnInit();
    component.addToCart();

    expect(cartService.addItem).toHaveBeenCalledWith(noVariantProduct, 1, undefined);
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('should show an error message when add to cart fails', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));
    (cartService.addItem as any) = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    component.ngOnInit();
    component.addToCart();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(component.error$.value).toBe('Failed to add item to cart. Please try again.');
    expect(router.navigate).not.toHaveBeenCalledWith(['/cart']);
  });

  it('should not add to cart when product is missing', () => {
    component.addToCart();

    expect(cartService.addItem).not.toHaveBeenCalled();
    expect(component.error$.value).toBe('Product not found');
  });

  it('should not add to cart when a variant is required but not selected', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of([]));

    component.ngOnInit();
    component.addToCart();

    expect(cartService.addItem).not.toHaveBeenCalled();
    expect(component.error$.value).toBe('Please select a variant');
  });

  it('should navigate back to products', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should handle product not found error', () => {
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(null as any));
    // ngOnInit always chains into loadVariants, so it must return an observable
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of([]));

    component.ngOnInit();

    expect(component.loading$.value).toBe(false);
  });

  it('should unsubscribe on destroy', () => {
    const nextSpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  describe('Try It On', () => {
    // ngOnInit is what subscribes to the notification hub, so the push-driven tests below
    // need it to have run; the product/variant mocks just let it complete without erroring.
    beforeEach(() => {
      (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
      (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));
      component.ngOnInit();
    });

    it('shows an error when submitting without a photo', () => {
      component.tryOnPhotoFile = null;
      component.submitTryOn();
      let error: string | null = null;
      component.tryOnError$.subscribe((e) => (error = e));
      expect(error).toBe('Please choose a photo first.');
    });

    it('stays in the processing state after a successful submit', () => {
      component.product$.next(mockProduct);
      component.tryOnPhotoFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
      (tryOnService.submit as any).mockReturnValue(of({ requestId: 'req-1' }));

      component.submitTryOn();

      // The render has only been queued — processing must not clear until the push arrives.
      expect(component.tryOnRequestId).toBe('req-1');
      expect(component.tryOnProcessing$.value).toBe(true);
      expect(component.tryOnResultImageUrl$.value).toBeNull();
    });

    it('shows the quota-exceeded message on a 429 error', () => {
      component.product$.next(mockProduct);
      component.tryOnPhotoFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
      (tryOnService.submit as any).mockReturnValue(throwError(() => ({ status: 429 })));

      component.submitTryOn();

      let error: string | null = null;
      component.tryOnError$.subscribe((e) => (error = e));
      expect(error).toContain("this month's try-on limit");
      expect(component.tryOnProcessing$.value).toBe(false);
    });

    it('renders the result image when a matching TryOnCompleted push arrives', () => {
      component.tryOnRequestId = 'req-1';
      component.tryOnProcessing$.next(true);
      (tryOnService.getStatus as any).mockReturnValue(
        of({ status: 'Completed', resultImageUrl: 'https://space.hf.space/file=r.png', failureReason: null })
      );

      notificationPushes.next({ type: 'TryOnCompleted', entityId: 'req-1' } as NotificationDto);

      expect(component.tryOnProcessing$.value).toBe(false);
      expect(component.tryOnResultImageUrl$.value).toBe('https://space.hf.space/file=r.png');
    });

    it('shows the failure reason when a TryOnFailed push arrives', () => {
      component.tryOnRequestId = 'req-1';
      component.tryOnProcessing$.next(true);
      (tryOnService.getStatus as any).mockReturnValue(
        of({ status: 'Failed', resultImageUrl: null, failureReason: 'Try-on render timed out.' })
      );

      notificationPushes.next({ type: 'TryOnFailed', entityId: 'req-1' } as NotificationDto);

      expect(component.tryOnProcessing$.value).toBe(false);
      expect(component.tryOnError$.value).toBe('Try-on render timed out.');
    });

    it('ignores a push for a different request id', () => {
      component.tryOnRequestId = 'req-1';
      component.tryOnProcessing$.next(true);

      notificationPushes.next({ type: 'TryOnCompleted', entityId: 'someone-elses-id' } as NotificationDto);

      expect(tryOnService.getStatus).not.toHaveBeenCalled();
      expect(component.tryOnProcessing$.value).toBe(true);
    });

    it('ignores an unrelated notification type for its own request id', () => {
      component.tryOnRequestId = 'req-1';
      component.tryOnProcessing$.next(true);

      notificationPushes.next({ type: 'OrderPlaced', entityId: 'req-1' } as NotificationDto);

      expect(tryOnService.getStatus).not.toHaveBeenCalled();
      expect(component.tryOnProcessing$.value).toBe(true);
    });

    it('clears in-flight try-on state when the route switches to another product', () => {
      // Angular reuses this component across /product/:id, so ngOnInit does not re-run; without an
      // explicit reset the previous product's spinner and requestId carry over.
      component.tryOnRequestId = 'req-1';
      component.tryOnProcessing$.next(true);
      component.tryOnResultImageUrl$.next('https://space.hf.space/file=old.png');

      activatedRoute.params.next({ id: '2' });

      expect(component.tryOnRequestId).toBeNull();
      expect(component.tryOnProcessing$.value).toBe(false);
      expect(component.tryOnResultImageUrl$.value).toBeNull();
    });

    it('resets the photo selection and clears prior state when a new file is chosen', () => {
      component.tryOnResultImageUrl$.next('https://space.hf.space/file=stale.png');
      component.tryOnError$.next('stale error');

      const file = new File(['x'], 'new-photo.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onTryOnPhotoSelected(event);

      expect(component.tryOnPhotoFile).toBe(file);
      let result: string | null = null;
      component.tryOnResultImageUrl$.subscribe((r) => (result = r));
      expect(result).toBeNull();
    });
  });

  describe('Find My Size', () => {
    const mockMeasurement = {
      chestCm: 96,
      waistCm: 80,
      hipsCm: 100,
      shoulderWidthCm: 44,
      inseamCm: 78,
      recommendedSize: 'M',
      confidence: 0.82,
    };

    it('renders the recommended size highlighted against the unique sizes (DOM)', () => {
      (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
      (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));
      fixture.detectChanges(); // runs ngOnInit — loads product + variants (sizes M, L)

      component.measurementResult$.next(mockMeasurement);
      fixture.detectChanges();

      const badges = Array.from(
        fixture.nativeElement.querySelectorAll('.measurement-result .size-badge')
      ) as HTMLElement[];
      expect(badges.length).toBe(2);

      const highlighted = badges.filter((b) => b.classList.contains('badge-recommended'));
      expect(highlighted.length).toBe(1);
      expect(highlighted[0].textContent?.trim()).toBe('M');

      const notHighlighted = badges.filter((b) => !b.classList.contains('badge-recommended'));
      expect(notHighlighted.length).toBe(1);
      expect(notHighlighted[0].textContent?.trim()).toBe('L');
    });

    it('shows the 429-specific error message on a quota-exceeded response', () => {
      component.measurementPhotoFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
      (measurementService.estimate as any).mockReturnValue(throwError(() => ({ status: 429 })));

      component.submitMeasurement();

      let error: string | null = null;
      component.measurementError$.subscribe((e) => (error = e));
      expect(error).toContain("this month's AI usage limit");
    });

    it('shows an error when submitting without a photo', () => {
      component.measurementPhotoFile = null;
      component.submitMeasurement();
      let error: string | null = null;
      component.measurementError$.subscribe((e) => (error = e));
      expect(error).toBe('Please choose a photo first.');
      expect(measurementService.estimate).not.toHaveBeenCalled();
    });

    it('rejects an oversized measurement photo before upload', () => {
      const file = new File(['x'], 'huge.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 });
      const event = { target: { files: [file] } } as unknown as Event;

      component.onMeasurementPhotoSelected(event);

      expect(component.measurementPhotoFile).toBeNull();
      let error: string | null = null;
      component.measurementError$.subscribe((e) => (error = e));
      expect(error).toContain('10 MB');
      expect(measurementService.estimate).not.toHaveBeenCalled();
    });
  });
});
