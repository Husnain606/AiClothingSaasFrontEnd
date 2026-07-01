import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { ProductService } from '../../services/product.service';
import { Category, Product } from '../../models/product.model';
import { PagedResult } from '../../../../core/models/api-response.model';
import { of } from 'rxjs';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let productService: jasmine.SpyObj<ProductService>;

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
      tags: [],
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
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getCategories',
      'getProducts',
    ]);

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [{ provide: ProductService, useValue: productServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();

    expect(productService.getCategories).toHaveBeenCalled();
    expect(productService.getProducts).toHaveBeenCalled();
  });

  it('should handle category selection', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onCategorySelected(mockCategories[0]);

    expect(component.selectedCategory$.value).toEqual(mockCategories[0]);
    expect(component.currentPage$.value).toBe(1);
  });

  it('should clear category filter when null is passed', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onCategorySelected(mockCategories[0]);
    component.onCategorySelected(null);

    expect(component.selectedCategory$.value).toBeNull();
  });

  it('should handle search', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onSearch('test query');

    expect(component.searchQuery$.value).toBe('test query');
    expect(component.currentPage$.value).toBe(1);
  });

  it('should handle page change', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onPageChange(2);

    expect(component.currentPage$.value).toBe(2);
  });

  it('should handle add to cart', () => {
    spyOn(window, 'alert');

    component.onAddToCart(mockProducts[0]);

    expect(window.alert).toHaveBeenCalled();
  });

  it('should handle suggestions selected', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();
    component.onSuggestionsSelected(mockProducts);

    expect(component.products$.value).toEqual(mockProducts);
    expect(component.currentPage$.value).toBe(1);
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should update products when loading products', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();

    expect(component.products$.value).toEqual(mockProducts);
    expect(component.totalPages$.value).toBe(1);
  });

  it('should set loading state correctly', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    productService.getProducts.and.returnValue(of(mockPagedResult));

    component.ngOnInit();

    expect(component.loading$.value).toBe(false);
  });
});
