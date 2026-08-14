import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { TryOnApiResponse, TryOnSubmitted, TryOnStatus } from '../models/try-on.model';

@Injectable({ providedIn: 'root' })
export class TryOnService {
  constructor(private http: HttpClient) {}

  /**
   * Submits a render and returns as soon as the job is queued (202). The render itself
   * finishes minutes later on Hugging Face's free CPU tier — completion arrives via the
   * SignalR notification push, then `getStatus` fetches the actual result.
   */
  submit(
    photo: File,
    garmentImageUrl: string,
    productId: string,
    productVariantId?: string
  ): Observable<TryOnSubmitted> {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('garmentImageUrl', garmentImageUrl);
    formData.append('productId', productId);
    if (productVariantId) {
      formData.append('productVariantId', productVariantId);
    }

    return this.http
      .post<TryOnApiResponse<TryOnSubmitted>>(`${environment.tryOnApiBaseUrl}/tryon`, formData)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message || 'Try-on submission failed.');
          }
          return response.data;
        })
      );
  }

  getStatus(requestId: string): Observable<TryOnStatus> {
    return this.http
      .get<TryOnApiResponse<TryOnStatus>>(`${environment.tryOnApiBaseUrl}/tryon/${requestId}`)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message || 'Could not fetch try-on status.');
          }
          return response.data;
        })
      );
  }
}
