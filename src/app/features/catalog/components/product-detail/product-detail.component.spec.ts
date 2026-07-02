import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductVariant } from '../../models/product.model';
import { of } from 'rxjs';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: Partial<ProductService>;
  let router: Partial<Router>;
  let activatedRoute: any;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    categoryId: 'cat1',
    categoryName: 'Electronics',
    basePrice: 99.99,
    status: 'active',
    tags: ['tag1'],
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

  beforeEach(async () => {
    const productServiceMock = {
      getProductById: vi.fn(),
      getProductVariants: vi.fn(),
    } as unknown as Partial<ProductService>;
    const routerMock = {
      navigate: vi.fn(),
    } as unknown as Partial<Router>;

    activatedRoute = {
      params: of({ id: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as unknown as Partial<ProductService>;
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
    const alertSpy = vi.spyOn(window, 'alert');
    (productService.getProductById as any) = vi.fn().mockReturnValue(of(mockProduct));
    (productService.getProductVariants as any) = vi.fn().mockReturnValue(of(mockVariants));

    component.ngOnInit();
    component.quantity.setValue(2);
    component.addToCart();

    expect(alertSpy).toHaveBeenCalled();
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
});
