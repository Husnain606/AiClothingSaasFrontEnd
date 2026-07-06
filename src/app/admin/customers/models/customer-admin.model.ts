export interface CustomerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WishlistItemDto {
  id: string;
  productId: string;
  productVariantId?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  productBasePrice?: number | null;
  primaryImageUrl?: string | null;
  createdAt: string;
}

export interface WishlistDto {
  id: string;
  customerId: string;
  items: WishlistItemDto[];
}
