export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedVariant: {
    size?: string;
    color?: string;
  };
  imageUrl: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}
