import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { ReviewDto, ReviewStatus } from '../models/review-admin.model';

@Injectable({ providedIn: 'root' })
export class ReviewAdminService {
  private readonly base = 'tenant/reviews';

  constructor(private apiService: ApiService) {}

  getReviews(status?: ReviewStatus): Observable<PagedResult<ReviewDto>> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.apiService
      .get<PagedResult<ReviewDto>>(this.base, params)
      .pipe(map((r: ApiResponse<PagedResult<ReviewDto>>) => r.data));
  }

  approve(id: string): Observable<ReviewDto> {
    return this.apiService
      .post<ReviewDto>(`${this.base}/${id}/approve`, {})
      .pipe(map((r: ApiResponse<ReviewDto>) => r.data));
  }

  reject(id: string, reason: string): Observable<ReviewDto> {
    return this.apiService
      .post<ReviewDto>(`${this.base}/${id}/reject`, { reason })
      .pipe(map((r: ApiResponse<ReviewDto>) => r.data));
  }
}
