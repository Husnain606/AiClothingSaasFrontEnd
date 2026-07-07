import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { DiscountDto, DiscountRequest } from '../models/discount-admin.model';

@Injectable({ providedIn: 'root' })
export class DiscountAdminService {
  private readonly base = 'tenant/discounts';

  constructor(private apiService: ApiService) {}

  getDiscounts(page: number, pageSize: number): Observable<PagedResult<DiscountDto>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.apiService
      .get<PagedResult<DiscountDto>>(this.base, params)
      .pipe(map((r: ApiResponse<PagedResult<DiscountDto>>) => r.data));
  }

  getDiscount(id: string): Observable<DiscountDto> {
    return this.apiService.get<DiscountDto>(`${this.base}/${id}`).pipe(map((r: ApiResponse<DiscountDto>) => r.data));
  }

  createDiscount(req: DiscountRequest): Observable<DiscountDto> {
    return this.apiService.post<DiscountDto>(this.base, req).pipe(map((r: ApiResponse<DiscountDto>) => r.data));
  }

  updateDiscount(id: string, req: DiscountRequest): Observable<DiscountDto> {
    return this.apiService
      .put<DiscountDto>(`${this.base}/${id}`, req)
      .pipe(map((r: ApiResponse<DiscountDto>) => r.data));
  }

  deactivateDiscount(id: string): Observable<boolean> {
    return this.apiService
      .post<boolean>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((r: ApiResponse<boolean>) => r.data));
  }

  deleteDiscount(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.base}/${id}`).pipe(map((r: ApiResponse<void>) => r.data));
  }
}
