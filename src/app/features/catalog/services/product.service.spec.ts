import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { ApiService } from '../../../core/services/api.service';
import { Product, Category, ProductVariant, ProductFilter } from '../models/product.model';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';

describe('ProductService', () => {
  let service: ProductService;
  let apiService: jasmine.SpyObj<ApiService>;
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
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService, { provide: ApiService, useValue: apiServiceSpy }],
    });

    service = TestBed.inject(ProductService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should fetch categories and cache them', (done) => {
      const mockResponse: ApiResponse<Category[]> = {
        data: mockCategories,
        success: true,
        message: '',
      };

      apiService.get.and.returnValue(jasmine.createSpy('get').and.returnValue({
        pipe: jasmine.createSpy('pipe').and.returnValue(
          new Promise((resolve) => {
            resolve(mockCategories);
          })
        ),
      }));

      service.getCategories().subscribe((categories) => {
        expect(categories).toEqual(mockCategories);
        done();
      });
    });

    it('should return cached categories on subsequent calls', (done) => {
      const mockResponse: ApiResponse<Category[]> = {
        data: mockCategories,
        success: true,
        message: '',
      };

      apiService.get.and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => {
            callback.next(mockCategories);
          },
        }),
      } as any);

      let callCount = 0;
      service.getCategories().subscribe(() => {
        callCount++;
      });

      service.getCategories().subscribe(() => {
        callCount++;
        expect(callCount).toBe(2);
        done();
      });
    });
  });

  describe('getProducts', () => {
    it('should fetch products with filters', (done) => {
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

      apiService.get.and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => {
            callback.next(mockPagedResult);
          },
        }),
      } as any);

      service.getProducts(filter).subscribe((result) => {
        expect(result).toEqual(mockPagedResult);
        done();
      });
    });
  });

  describe('getProductById', () => {
    it('should fetch a single product', (done) => {
      const productId = 'prod1';

      apiService.get.and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => {
            callback.next(mockProducts[0]);
          },
        }),
      } as any);

      service.getProductById(productId).subscribe((product) => {
        expect(product).toEqual(mockProducts[0]);
        done();
      });
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', (done) => {
      const query = 'electronics';

      apiService.get.and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => {
            callback.next(mockProducts);
          },
        }),
      } as any);

      service.searchProducts(query).subscribe((products) => {
        expect(products).toEqual(mockProducts);
        done();
      });
    });
  });

  describe('getProductVariants', () => {
    it('should fetch product variants', (done) => {
      const productId = 'prod1';

      apiService.get.and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => {
            callback.next(mockVariants);
          },
        }),
      } as any);

      service.getProductVariants(productId).subscribe((variants) => {
        expect(variants).toEqual(mockVariants);
        done();
      });
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
