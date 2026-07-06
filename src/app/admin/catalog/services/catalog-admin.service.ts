import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import {
  CategoryDto,
  CategoryTreeNodeDto,
  CategoryOrderItem,
  ProductDto,
  ProductSummaryDto,
  ProductVariantDto,
  ProductImageDto,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  ProductFilter,
} from '../models/catalog-admin.model';

@Injectable({ providedIn: 'root' })
export class CatalogAdminService {
  constructor(private apiService: ApiService) {}

  private unwrap<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(map((r) => r.data));
  }

  getCategoryTree(): Observable<CategoryTreeNodeDto[]> {
    return this.unwrap(this.apiService.get<CategoryTreeNodeDto[]>('tenant/categories/tree'));
  }

  getCategories(): Observable<CategoryDto[]> {
    return this.unwrap(this.apiService.get<CategoryDto[]>('tenant/categories'));
  }

  createCategory(req: CreateCategoryRequest): Observable<CategoryDto> {
    return this.unwrap(this.apiService.post<CategoryDto>('tenant/categories', req));
  }

  updateCategory(id: string, req: UpdateCategoryRequest): Observable<CategoryDto> {
    return this.unwrap(this.apiService.put<CategoryDto>(`tenant/categories/${id}`, req));
  }

  moveCategory(id: string, newParentId: string | null): Observable<CategoryDto> {
    return this.unwrap(this.apiService.put<CategoryDto>(`tenant/categories/${id}/move`, { newParentId }));
  }

  reorderCategories(items: CategoryOrderItem[]): Observable<void> {
    return this.unwrap(this.apiService.put<void>('tenant/categories/reorder', { items }));
  }

  deleteCategory(id: string): Observable<void> {
    return this.unwrap(this.apiService.delete<void>(`tenant/categories/${id}`));
  }

  getProducts(filter: ProductFilter): Observable<PagedResult<ProductSummaryDto>> {
    let params = new HttpParams()
      .set('page', String(filter.page ?? 1))
      .set('pageSize', String(filter.pageSize ?? 20));
    if (filter.search) params = params.set('search', filter.search);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.status) params = params.set('status', filter.status);
    return this.unwrap(this.apiService.get<PagedResult<ProductSummaryDto>>('tenant/products', params));
  }

  getProduct(id: string): Observable<ProductDto> {
    return this.unwrap(this.apiService.get<ProductDto>(`tenant/products/${id}`));
  }

  createProduct(req: CreateProductRequest): Observable<ProductDto> {
    return this.unwrap(this.apiService.post<ProductDto>('tenant/products', req));
  }

  updateProduct(id: string, req: UpdateProductRequest): Observable<ProductDto> {
    return this.unwrap(this.apiService.put<ProductDto>(`tenant/products/${id}`, req));
  }

  publishProduct(id: string): Observable<ProductDto> {
    return this.unwrap(this.apiService.post<ProductDto>(`tenant/products/${id}/publish`, {}));
  }

  archiveProduct(id: string): Observable<ProductDto> {
    return this.unwrap(this.apiService.post<ProductDto>(`tenant/products/${id}/archive`, {}));
  }

  deleteProduct(id: string): Observable<void> {
    return this.unwrap(this.apiService.delete<void>(`tenant/products/${id}`));
  }

  getVariants(productId: string): Observable<ProductVariantDto[]> {
    return this.unwrap(this.apiService.get<ProductVariantDto[]>(`tenant/products/${productId}/variants`));
  }

  addVariant(req: CreateVariantRequest): Observable<ProductVariantDto> {
    return this.unwrap(this.apiService.post<ProductVariantDto>('tenant/variants', req));
  }

  updateVariant(id: string, req: UpdateVariantRequest): Observable<ProductVariantDto> {
    return this.unwrap(this.apiService.put<ProductVariantDto>(`tenant/variants/${id}`, req));
  }

  deactivateVariant(id: string): Observable<ProductVariantDto> {
    return this.unwrap(this.apiService.post<ProductVariantDto>(`tenant/variants/${id}/deactivate`, {}));
  }

  deleteVariant(id: string): Observable<void> {
    return this.unwrap(this.apiService.delete<void>(`tenant/variants/${id}`));
  }

  getImages(productId: string): Observable<ProductImageDto[]> {
    return this.unwrap(this.apiService.get<ProductImageDto[]>(`tenant/products/${productId}/images`));
  }

  uploadImage(productId: string, file: File, altText?: string): Observable<ProductImageDto> {
    const formData = new FormData();
    formData.append('ProductId', productId);
    formData.append('File', file);
    if (altText) formData.append('AltText', altText);
    return this.unwrap(this.apiService.post<ProductImageDto>('tenant/products/images', formData));
  }

  reorderImages(productId: string, orderedIds: string[]): Observable<void> {
    return this.unwrap(
      this.apiService.put<void>(`tenant/products/${productId}/images/reorder`, { ids: orderedIds })
    );
  }

  setPrimaryImage(id: string): Observable<void> {
    return this.unwrap(this.apiService.post<void>(`tenant/products/images/${id}/set-primary`, {}));
  }

  deleteImage(id: string): Observable<void> {
    return this.unwrap(this.apiService.delete<void>(`tenant/products/images/${id}`));
  }
}
