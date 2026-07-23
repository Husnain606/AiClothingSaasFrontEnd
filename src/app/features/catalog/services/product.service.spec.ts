import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category, ProductVariant, ProductFilter } from '../models/product.model';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { environment } from '@env/environment';
import { of } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let apiService: Partial<ApiService>;
  let httpMock: HttpTestingController;

  /** ApiService returns ApiResponse<T>; ProductService maps response.data */
  const asApiResponse = <T>(data: T): ApiResponse<T> => ({
    statusCode: 200,
    message: 'OK',
    data,
    errors: null,
    timestamp: '2024-01-01T00:00:00Z',
  });

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
      id: 'prod1',
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'Sample description',
      categoryId: 'cat1',
      categoryName: 'Electronics',
      basePrice: 99.99,
      status: 'active',
      tags: ['tag1'],
      variantCount: 2,
      primaryImageUrl: 'https://example.com/image.jpg',
      approvedReviewCount: 5,
      averageRating: 4.5,
      createdAt: '2024-01-01',
    },
  ];

  const mockVariants: ProductVariant[] = [
    {
      id: 'var1',
      productId: 'prod1',
      size: 'M',
      color: 'Red',
      sku: 'SKU123',
      stockQuantity: 10,
      priceOverride: null,
      effectivePrice: 99.99,
      isActive: true,
      createdAt: '2024-01-01',
    },
  ];

  beforeEach(() => {
    const apiServiceMock = {
      get: vi.fn(),
    } as unknown as Partial<ApiService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(ProductService);
    apiService = TestBed.inject(ApiService) as unknown as Partial<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // getCategories/getProducts/getProductById hit the new public slug-based routes
  // (api/{slug}/categories, api/{slug}/products, api/{slug}/products/{id}) directly via
  // HttpClient rather than ApiService, so these specs assert against HttpTestingController
  // instead of the ApiService mock.
  const publicCatalogBaseUrl = `${environment.apiBaseUrl}/${environment.tenantSlug}`;

  describe('getCategories', () => {
    it('should fetch categories from the public slug-based route and cache them', async () => {
      const resultPromise = service.getCategories().toPromise();

      const req = httpMock.expectOne(`${publicCatalogBaseUrl}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(asApiResponse(mockCategories));

      expect(await resultPromise).toEqual(mockCategories);
    });

    it('should return cached categories on subsequent calls without a second request', async () => {
      const result1Promise = service.getCategories().toPromise();
      httpMock.expectOne(`${publicCatalogBaseUrl}/categories`).flush(asApiResponse(mockCategories));
      const result1 = await result1Promise;

      const result2 = await service.getCategories().toPromise();

      expect(result1).toEqual(mockCategories);
      expect(result2).toEqual(mockCategories);
    });
  });

  describe('getProducts', () => {
    it('should fetch products from the public slug-based route with filters', async () => {
      const filter: ProductFilter = {
        page: 1,
        pageSize: 20,
        search: 'test',
        categoryId: 'cat1',
      };

      const mockPagedResult: PagedResult<Product> = {
        items: mockProducts,
        totalCount: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      const resultPromise = service.getProducts(filter).toPromise();

      const req = httpMock.expectOne(
        (r) => r.url === `${publicCatalogBaseUrl}/products` && r.params.get('search') === 'test'
      );
      expect(req.request.method).toBe('GET');
      req.flush(asApiResponse(mockPagedResult));

      expect(await resultPromise).toEqual(mockPagedResult);
    });
  });

  describe('getProductById', () => {
    it('should fetch a single product from the public slug-based route', async () => {
      const productId = 'prod1';

      const resultPromise = service.getProductById(productId).toPromise();

      const req = httpMock.expectOne(`${publicCatalogBaseUrl}/products/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(asApiResponse(mockProducts[0]));

      expect(await resultPromise).toEqual(mockProducts[0]);
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const query = 'electronics';

      (apiService.get as any) = vi.fn().mockReturnValue(of(asApiResponse(mockProducts)));

      const result = await service.searchProducts(query).toPromise();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductVariants', () => {
    it('should fetch product variants', async () => {
      const productId = 'prod1';

      (apiService.get as any) = vi.fn().mockReturnValue(of(asApiResponse(mockVariants)));

      const result = await service.getProductVariants(productId).toPromise();
      expect(result).toEqual(mockVariants);
    });
  });

  describe('clearProductCache', () => {
    it('should clear product cache', () => {
      service.clearProductCache();
      expect(service['productCache'].size).toBe(0);
    });
  });

  describe('clearAllCaches', () => {
    it('should clear all caches', () => {
      service.clearAllCaches();
      expect(service['categoriesCache$']).toBeNull();
      expect(service['productCache'].size).toBe(0);
    });
  });
});
