import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../cart/services/cart.service';
import { Category, Product } from '../../models/product.model';
import { PagedResult } from '../../../../core/models/api-response.model';
import { Cart } from '../../../cart/models/cart.model';
import { of, throwError } from 'rxjs';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let productService: Partial<ProductService>;
  let cartService: Partial<CartService>;

  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic items',
      parentCategoryId: null,
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-01',
    },
  ];

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test',
      categoryId: 'cat1',
      categoryName: 'Electronics',
      basePrice: 99.99,
      status: 'active',
      tags: '',
      variantCount: 1,
      primaryImageUrl: 'image.jpg',
      approvedReviewCount: 0,
      averageRating: 4.5,
      createdAt: '2024-01-01',
    },
  ];

  const mockPagedResult: PagedResult<Product> = {
    items: mockProducts,
    totalCount: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };

  const mockCart: Cart = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  };

  beforeEach(async () => {
    const productServiceMock = {
      getCategories: vi.fn(),
      getProducts: vi.fn(),
    } as unknown as Partial<ProductService>;

    const cartServiceMock = {
      addItem: vi.fn().mockReturnValue(of(mockCart)),
    } as unknown as Partial<CartService>;

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as unknown as Partial<ProductService>;
    cartService = TestBed.inject(CartService) as unknown as Partial<CartService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();

    expect(productService.getCategories).toHaveBeenCalled();
    expect(productService.getProducts).toHaveBeenCalled();
  });

  it('should handle category selection', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onCategorySelected(mockCategories[0]);

    expect(component.selectedCategory$.value).toEqual(mockCategories[0]);
    expect(component.currentPage$.value).toBe(1);
  });

  it('should clear category filter when null is passed', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onCategorySelected(mockCategories[0]);
    component.onCategorySelected(null);

    expect(component.selectedCategory$.value).toBeNull();
  });

  it('should handle search', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onSearch('test query');

    expect(component.searchQuery$.value).toBe('test query');
    expect(component.currentPage$.value).toBe(1);
  });

  it('should handle page change', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onPageChange(2);

    expect(component.currentPage$.value).toBe(2);
  });

  it('should handle add to cart', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.onAddToCart(mockProducts[0]);

    expect(cartService.addItem).toHaveBeenCalledWith(mockProducts[0], 1);
    expect(alertSpy).toHaveBeenCalled();
  });

  it('should show an error alert when add to cart fails', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (cartService.addItem as any) = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    component.onAddToCart(mockProducts[0]);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Failed to add item to cart. Please try again.');
  });

  it('should handle suggestions selected', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onSuggestionsSelected(mockProducts);

    expect(component.products$.value).toEqual(mockProducts);
    expect(component.currentPage$.value).toBe(1);
  });

  it('should unsubscribe on destroy', () => {
    const nextSpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should update products when loading products', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();

    expect(component.products$.value).toEqual(mockProducts);
    expect(component.totalPages$.value).toBe(1);
  });

  it('should set loading state correctly', () => {
    (productService.getCategories as any) = vi.fn().mockReturnValue(of(mockCategories));
    (productService.getProducts as any) = vi.fn().mockReturnValue(of(mockPagedResult));

    component.ngOnInit();

    expect(component.loading$.value).toBe(false);
  });
});
