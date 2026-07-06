export type ProductStatus = 'Draft' | 'Active' | 'Archived';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentCategoryId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryTreeNodeDto {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  children: CategoryTreeNodeDto[];
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  categoryName?: string | null;
  basePrice: number;
  status: ProductStatus;
  tags?: string | null;
  variantCount: number;
  primaryImageUrl?: string | null;
  approvedReviewCount: number;
  averageRating?: number | null;
  createdAt: string;
}

export interface ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  basePrice: number;
  status: ProductStatus;
  tags?: string | null;
  createdAt: string;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  priceOverride: number | null;
  effectivePrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductImageDto {
  id: string;
  productId: string;
  variantId?: string | null;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  basePrice: number;
  tags?: string | null;
}

export type UpdateProductRequest = CreateProductRequest;

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
  parentCategoryId: string | null;
  sortOrder: number;
}

export interface UpdateCategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryOrderItem {
  id: string;
  sortOrder: number;
}

export interface CreateVariantRequest {
  productId: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  priceOverride?: number | null;
}

export interface UpdateVariantRequest {
  sku: string;
  size: string;
  color: string;
  isActive: boolean;
  priceOverride?: number | null;
}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  page?: number;
  pageSize?: number;
}
