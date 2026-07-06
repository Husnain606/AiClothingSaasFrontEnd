import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { CheckoutForm } from '../models/checkout.model';
import { CartItem } from '../../cart/models/cart.model';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'store/orders';

  constructor(private apiService: ApiService) {}

  createOrder(checkout: CheckoutForm, cartItems: CartItem[]): Observable<Order> {
    const payload = {
      shippingAddress: checkout.shippingAddress,
      paymentInfo: {
        cardholderName: checkout.paymentInfo.cardholderName,
        cardNumber: checkout.paymentInfo.cardNumber, // Already masked
        // CVV, expiryMonth, expiryYear are never sent — backend CreateOrderRequest does not accept them
      },
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        variant: item.selectedVariant
      }))
    };
    return this.apiService.post<Order>(this.apiUrl, payload)
      .pipe(
        map((response: ApiResponse<Order>) => response.data)
      );
  }

  getOrders(): Observable<Order[]> {
    return this.apiService.get<Order[]>(this.apiUrl)
      .pipe(
        map((response: ApiResponse<Order[]>) => response.data)
      );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.apiService.get<Order>(`${this.apiUrl}/${orderId}`)
      .pipe(
        map((response: ApiResponse<Order>) => response.data)
      );
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.apiService.put<Order>(`${this.apiUrl}/${orderId}/cancel`, {})
      .pipe(
        map((response: ApiResponse<Order>) => response.data)
      );
  }
}
