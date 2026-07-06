import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { CustomerDto, WishlistDto } from '../models/customer-admin.model';

@Injectable({ providedIn: 'root' })
export class CustomerAdminService {
  private readonly base = 'tenant/customers';

  constructor(private apiService: ApiService) {}

  getCustomers(page: number, pageSize: number, search?: string): Observable<PagedResult<CustomerDto>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (search) params = params.set('search', search);
    return this.apiService
      .get<PagedResult<CustomerDto>>(this.base, params)
      .pipe(map((r: ApiResponse<PagedResult<CustomerDto>>) => r.data));
  }

  getCustomer(id: string): Observable<CustomerDto> {
    return this.apiService.get<CustomerDto>(`${this.base}/${id}`).pipe(map((r: ApiResponse<CustomerDto>) => r.data));
  }

  deactivateCustomer(id: string): Observable<CustomerDto> {
    return this.apiService
      .post<CustomerDto>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((r: ApiResponse<CustomerDto>) => r.data));
  }

  getWishlist(customerId: string): Observable<WishlistDto> {
    return this.apiService
      .get<WishlistDto>(`${this.base}/${customerId}/wishlist`)
      .pipe(map((r: ApiResponse<WishlistDto>) => r.data));
  }
}
