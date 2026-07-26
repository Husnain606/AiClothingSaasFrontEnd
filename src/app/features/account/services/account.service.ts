import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import {
  CustomerProfile,
  Order,
  WishlistItem,
  WishlistResponse,
  ChangePasswordRequest,
} from '../models/account.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private apiService: ApiService, private http: HttpClient) {}

  /**
   * Get customer profile
   */
  getProfile(): Observable<CustomerProfile> {
    return this.apiService
      .get<CustomerProfile>('account/profile')
      .pipe(map((response: ApiResponse<CustomerProfile>) => response.data));
  }

  /**
   * Update customer profile
   */
  updateProfile(profile: Partial<CustomerProfile>): Observable<CustomerProfile> {
    return this.apiService
      .put<CustomerProfile>('account/profile', profile)
      .pipe(map((response: ApiResponse<CustomerProfile>) => response.data));
  }

  /**
   * Get customer's past orders with pagination
   */
  getOrders(page: number = 1, pageSize: number = 10): Observable<Order[]> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.apiService
      .get<PagedResult<Order>>('store/orders', params)
      .pipe(
        map((response: ApiResponse<PagedResult<Order>>) => response.data.items)
      );
  }

  /**
   * Get single order detail by ID
   */
  getOrderById(orderId: string): Observable<Order> {
    return this.apiService
      .get<Order>(`store/orders/${orderId}`)
      .pipe(map((response: ApiResponse<Order>) => response.data));
  }

  /**
   * Get customer's wishlist items. Backend returns a WishlistResponse wrapper
   * ({id, customerId, items}), not a bare array - unwrap .items here so callers
   * keep working with a flat WishlistItem[].
   */
  getWishlist(): Observable<WishlistItem[]> {
    return this.apiService
      .get<WishlistResponse>('account/wishlist')
      .pipe(map((response: ApiResponse<WishlistResponse>) => response.data?.items || []));
  }

  /**
   * Add item to wishlist
   */
  addToWishlist(productId: string): Observable<WishlistItem> {
    return this.apiService
      .post<WishlistItem>('account/wishlist', { productId })
      .pipe(map((response: ApiResponse<WishlistItem>) => response.data));
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(wishlistItemId: string): Observable<void> {
    return this.apiService
      .delete<void>(`account/wishlist/${wishlistItemId}`)
      .pipe(map(() => undefined));
  }

  /**
   * Change password. Note: the real route is PUT api/auth/change-password
   * (AuthController), not account/change-password - there's no tenant-scoped
   * "account" password endpoint, password changes go through the shared auth API.
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.apiService
      .put<void>('auth/change-password', request)
      .pipe(map(() => undefined));
  }

  /** Fetches the customer's own payment proof as a Blob (the backend streams the file). */
  getOrderPaymentProof(orderId: string): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/store/orders/${orderId}/payment-proof`, {
      responseType: 'blob'
    });
  }
}
