import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category, ProductVariant, ProductFilter } from '../models/product.model';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { of } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let apiService: Partial<ApiService>;
  let httpMock: HttpTestingController;

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

  describe('getCategories', () => {
    it('should fetch categories and cache them', async () => {
      (apiService.get as any) = vi.fn().mockReturnValue(of(mockCategories));

      const result = await service.getCategories().toPromise();
      expect(result).toEqual(mockCategories);
    });

    it('should return cached categories on subsequent calls', async () => {
      (apiService.get as any) = vi.fn().mockReturnValue(of(mockCategories));

      const result1 = await service.getCategories().toPromise();
      const result2 = await service.getCategories().toPromise();

      expect(result1).toEqual(mockCategories);
      expect(result2).toEqual(mockCategories);
    });
  });

  describe('getProducts', () => {
    it('should fetch products with filters', async () => {
      const filter: ProductFilter = {
        page: 1,
        pageSize: 20,
        search: 'test',
        categoryId: 'cat1',
      };

      const mockPagedResult: PagedResult<Product> = {
        items: mockProducts,
        totalCount: 1,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 1,
      };

      (apiService.get as any) = vi.fn().mockReturnValue(of(mockPagedResult));

      const result = await service.getProducts(filter).toPromise();
      expect(result).toEqual(mockPagedResult);
    });
  });

  describe('getProductById', () => {
    it('should fetch a single product', async () => {
      const productId = 'prod1';

      (apiService.get as any) = vi.fn().mockReturnValue(of(mockProducts[0]));

      const result = await service.getProductById(productId).toPromise();
      expect(result).toEqual(mockProducts[0]);
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const query = 'electronics';

      (apiService.get as any) = vi.fn().mockReturnValue(of(mockProducts));

      const result = await service.searchProducts(query).toPromise();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductVariants', () => {
    it('should fetch product variants', async () => {
      const productId = 'prod1';

      (apiService.get as any) = vi.fn().mockReturnValue(of(mockVariants));

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
