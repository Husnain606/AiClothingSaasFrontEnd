import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, tap, map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { Product, ProductVariant, Category, ProductFilter } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private categoriesCache$: Observable<Category[]> | null = null;
  private productCache: Map<string, Observable<Product>> = new Map();

  constructor(private apiService: ApiService) {}

  /**
   * Get all categories (cached with shareReplay)
   */
  getCategories(): Observable<Category[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.apiService.get<Category[]>('categories').pipe(
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
    if (filter.status) {
      params = params.set('status', filter.status);
    }

    return this.apiService.get<PagedResult<Product>>('products', params).pipe(
      map((response: ApiResponse<PagedResult<Product>>) => response.data)
    );
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product> {
    // Check cache first
    if (this.productCache.has(id)) {
      return this.productCache.get(id)!;
    }

    const product$ = this.apiService.get<Product>(`products/${id}`).pipe(
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
   * Get product variants by product ID
   */
  getProductVariants(productId: string): Observable<ProductVariant[]> {
    return this.apiService.get<ProductVariant[]>(`products/${productId}/variants`).pipe(
      map((response: ApiResponse<ProductVariant[]>) => response.data)
    );
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
