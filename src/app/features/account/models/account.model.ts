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
  orderId: string;
  orderDate: Date;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  addedDate: Date;
  inStock: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
