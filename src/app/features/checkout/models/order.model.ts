import { ShippingAddress } from './checkout.model';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

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

export interface Order {
  orderId: string;          // "ORD-2026-001234"
  customerId: string;
  orderDate: Date;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;     // 0 for demo
  total: number;
  trackingNumber?: string;
}
