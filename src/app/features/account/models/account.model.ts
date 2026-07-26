export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  createdDate: Date;
  lastModifiedDate: Date;
}

export interface Order {
  orderId: string; // order-number, e.g. "ORD-2026-000001" - used for display
  id: string; // internal guid - the backend's payment-proof route binds Guid id, not the order number
  orderDate: Date;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

// Matches FashionSaaS.Application.Wishlists.DTOs.WishlistItemResponse exactly -
// productVariantId/productSlug are nullable since a deleted product leaves the
// wishlist item's summary fields null (ProductService null-coalesces on removal).
export interface WishlistItem {
  id: string;
  productId: string;
  productVariantId: string | null;
  productName: string | null;
  productSlug: string | null;
  productBasePrice: number | null;
  primaryImageUrl: string | null;
  createdAt: string;
}

export interface WishlistResponse {
  id: string;
  customerId: string;
  items: WishlistItem[];
}

// Matches FashionSaaS.Application.Auth.DTOs.ChangePasswordRequest exactly - the
// backend has no confirmPassword field; confirm-matches-new is a client-side-only check.
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
