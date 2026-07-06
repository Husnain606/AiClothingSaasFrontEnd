import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { OrderDto, OrderFilter } from '../models/order-admin.model';

@Injectable({ providedIn: 'root' })
export class OrderAdminService {
  private readonly base = 'tenant/orders';

  constructor(private apiService: ApiService) {}

  getOrders(filter: OrderFilter): Observable<PagedResult<OrderDto>> {
    let params = new HttpParams();
    if (filter.status) params = params.set('status', filter.status);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.customerId) params = params.set('customerId', filter.customerId);
    if (filter.customerEmail) params = params.set('customerEmail', filter.customerEmail);
    if (filter.search) params = params.set('search', filter.search);
    params = params.set('page', String(filter.page ?? 1));
    params = params.set('pageSize', String(filter.pageSize ?? 20));

    return this.apiService
      .get<PagedResult<OrderDto>>(this.base, params)
      .pipe(map((response: ApiResponse<PagedResult<OrderDto>>) => response.data));
  }

  getOrder(id: string): Observable<OrderDto> {
    return this.apiService
      .get<OrderDto>(`${this.base}/${id}`)
      .pipe(map((response: ApiResponse<OrderDto>) => response.data));
  }

  confirm(id: string): Observable<OrderDto> {
    return this.apiService
      .put<OrderDto>(`${this.base}/${id}/confirm`, {})
      .pipe(map((response: ApiResponse<OrderDto>) => response.data));
  }

  ship(id: string, trackingNumber?: string): Observable<OrderDto> {
    return this.apiService
      .put<OrderDto>(`${this.base}/${id}/ship`, { trackingNumber: trackingNumber ?? null })
      .pipe(map((response: ApiResponse<OrderDto>) => response.data));
  }

  deliver(id: string): Observable<OrderDto> {
    return this.apiService
      .put<OrderDto>(`${this.base}/${id}/deliver`, {})
      .pipe(map((response: ApiResponse<OrderDto>) => response.data));
  }

  cancel(id: string, reason: string): Observable<OrderDto> {
    return this.apiService
      .put<OrderDto>(`${this.base}/${id}/cancel`, { reason })
      .pipe(map((response: ApiResponse<OrderDto>) => response.data));
  }
}
