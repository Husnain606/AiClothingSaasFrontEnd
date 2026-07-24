import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, tap, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { Product, ProductVariant, Category, ProductFilter } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private categoriesCache$: Observable<Category[]> | null = null;
  private productCache: Map<string, Observable<Product>> = new Map();

  // Public, unauthenticated catalog-browsing calls (categories/products/product-by-id)
  // hit the new slug-based public routes (api/{slug}/categories, api/{slug}/products,
  // api/{slug}/products/{id}) directly via HttpClient rather than through ApiService,
  // because ApiService's bare `{apiBaseUrl}/{endpoint}` shape is for authenticated
  // admin/customer calls whose tenant comes from the JWT claim and must NOT be
  // slug-prefixed. The slug itself is read from environment.tenantSlug, which is
  // hardcoded per-environment for local dev/testing only — resolving the real tenant
  // slug from the production subdomain is a separate, out-of-scope piece of work (see
  // environment.prod.ts).
  private readonly publicCatalogBaseUrl = `${environment.apiBaseUrl}/${environment.tenantSlug}`;

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get all categories (cached with shareReplay)
   */
  getCategories(): Observable<Category[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http
        .get<ApiResponse<Category[]>>(`${this.publicCatalogBaseUrl}/categories`)
        .pipe(
          map((response: ApiResponse<Category[]>) => response.data),
          shareReplay(1)
        );
    }
    return this.categoriesCache$;
  }

  /**
   * Get paginated products with filtering
   */
  getProducts(filter: ProductFilter): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('page', filter.page?.toString() || '1')
      .set('pageSize', filter.pageSize?.toString() || '20');

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.categoryId) {
      params = params.set('categoryId', filter.categoryId);
    }

    return this.http
      .get<ApiResponse<PagedResult<Product>>>(`${this.publicCatalogBaseUrl}/products`, { params })
      .pipe(map((response: ApiResponse<PagedResult<Product>>) => response.data));
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product> {
    // Check cache first
    if (this.productCache.has(id)) {
      return this.productCache.get(id)!;
    }

    const product$ = this.http.get<ApiResponse<Product>>(`${this.publicCatalogBaseUrl}/products/${id}`).pipe(
      map((response: ApiResponse<Product>) => response.data),
      shareReplay(1),
      tap(() => {
        // Cache the result
        this.productCache.set(id, product$);
      })
    );

    return product$;
  }

  /**
   * Search products by query string
   */
  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('search', query);
    return this.apiService.get<Product[]>('products/search', params).pipe(
      map((response: ApiResponse<Product[]>) => response.data)
    );
  }

  /**
   * Get products filtered by category
   */
  getProductsByCategory(categoryId: string): Observable<PagedResult<Product>> {
    return this.getProducts({
      categoryId,
      page: 1,
      pageSize: 20,
    });
  }

  /**
   * Get product variants by product ID. Same public, unauthenticated slug-based route
   * as getProductById/getProducts above — a customer browsing the storefront has no
   * JWT, so this cannot go through ApiService's authenticated-call base URL.
   */
  getProductVariants(productId: string): Observable<ProductVariant[]> {
    return this.http
      .get<ApiResponse<ProductVariant[]>>(`${this.publicCatalogBaseUrl}/products/${productId}/variants`)
      .pipe(map((response: ApiResponse<ProductVariant[]>) => response.data));
  }

  /**
   * Clear product cache (useful when navigating away)
   */
  clearProductCache(): void {
    this.productCache.clear();
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.categoriesCache$ = null;
    this.clearProductCache();
  }
}
