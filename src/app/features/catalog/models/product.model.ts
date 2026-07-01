export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  status: string;
  tags: string[];
  variantCount: number;
  primaryImageUrl: string;
  approvedReviewCount: number;
  averageRating: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  priceOverride: number | null;
  effectivePrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentCategoryId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductFilter {
  tenantId?: string;
  search?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
