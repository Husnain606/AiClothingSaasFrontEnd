import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StockAdjustRequest, LowStockItem, StockHistoryEntry } from '../models/inventory-admin.model';

@Injectable({ providedIn: 'root' })
export class InventoryAdminService {
  private readonly base = 'tenant/inventory';

  constructor(private apiService: ApiService) {}

  adjustStock(req: StockAdjustRequest): Observable<void> {
    return this.apiService
      .post<void>(`${this.base}/adjust`, req)
      .pipe(map((r: ApiResponse<void>) => r.data));
  }

  getLowStock(threshold?: number): Observable<LowStockItem[]> {
    const params = threshold !== undefined ? new HttpParams().set('threshold', String(threshold)) : undefined;
    return this.apiService
      .get<LowStockItem[]>(`${this.base}/low-stock`, params)
      .pipe(map((r: ApiResponse<LowStockItem[]>) => r.data));
  }

  getStockHistory(variantId: string): Observable<StockHistoryEntry[]> {
    return this.apiService
      .get<StockHistoryEntry[]>(`${this.base}/variants/${variantId}/history`)
      .pipe(map((r: ApiResponse<StockHistoryEntry[]>) => r.data));
  }
}
