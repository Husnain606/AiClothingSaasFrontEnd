import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import {
  CustomerProfile,
  Order,
  WishlistItem,
  WishlistResponse,
  ChangePasswordRequest,
} from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private apiService: ApiService) {}

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
   * Change password
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.apiService
      .post<void>('account/change-password', request)
      .pipe(map(() => undefined));
  }
}
