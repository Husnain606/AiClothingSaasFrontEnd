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
    const formData = new FormData();

    const address = checkout.shippingAddress;
    formData.append('ShippingAddress.FirstName', address.firstName);
    formData.append('ShippingAddress.LastName', address.lastName);
    formData.append('ShippingAddress.Email', address.email);
    formData.append('ShippingAddress.Phone', address.phone);
    formData.append('ShippingAddress.Street', address.street);
    formData.append('ShippingAddress.City', address.city);
    formData.append('ShippingAddress.State', address.state);
    formData.append('ShippingAddress.ZipCode', address.zipCode);
    formData.append('ShippingAddress.Country', address.country);

    cartItems.forEach((item, index) => {
      formData.append(`Items[${index}].ProductId`, item.productId);
      formData.append(`Items[${index}].Quantity`, item.quantity.toString());
      if (item.selectedVariant?.size) {
        formData.append(`Items[${index}].Variant.Size`, item.selectedVariant.size);
      }
      if (item.selectedVariant?.color) {
        formData.append(`Items[${index}].Variant.Color`, item.selectedVariant.color);
      }
    });

    if (checkout.paymentProof.file) {
      formData.append('paymentProof', checkout.paymentProof.file);
    }

    return this.apiService.post<Order>(this.apiUrl, formData)
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
