import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PagedResult } from '../../../core/models/api-response.model';
import { NotificationDto, NotificationFilterParams } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsAdminService {
  private readonly base = 'tenant/notifications';

  constructor(private apiService: ApiService) {}

  getPaged(filter?: NotificationFilterParams): Observable<PagedResult<NotificationDto>> {
    let params = new HttpParams();
    if (filter?.page !== undefined) params = params.set('page', String(filter.page));
    if (filter?.pageSize !== undefined) params = params.set('pageSize', String(filter.pageSize));

    return this.apiService
      .get<PagedResult<NotificationDto>>(this.base, params)
      .pipe(map((r: ApiResponse<PagedResult<NotificationDto>>) => r.data));
  }

  getUnreadCount(): Observable<number> {
    return this.apiService
      .get<number>(`${this.base}/unread-count`)
      .pipe(map((r: ApiResponse<number>) => r.data));
  }

  markRead(id: string): Observable<void> {
    return this.apiService
      .put<void>(`${this.base}/${id}/mark-read`, {})
      .pipe(map((r: ApiResponse<void>) => r.data));
  }

  markAllRead(): Observable<void> {
    return this.apiService
      .put<void>(`${this.base}/mark-all-read`, {})
      .pipe(map((r: ApiResponse<void>) => r.data));
  }
}
