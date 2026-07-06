export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderVariant {
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  variant?: OrderVariant;
}

export interface OrderDto {
  orderId: string; // order-number, e.g. "ORD-2026-000001" — used for search/display
  id: string; // internal guid — used for admin detail route + action calls
  customerId: string;
  orderDate: string; // ISO
  status: OrderStatus;
  items: OrderItemDto[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string | null;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  variant?: OrderVariant;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentInfo: { cardholderName: string; cardNumber: string };
  items: CreateOrderItemRequest[];
}

export interface OrderFilter {
  status?: OrderStatus;
  from?: string; // ISO date
  to?: string; // ISO date
  customerId?: string;
  customerEmail?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
