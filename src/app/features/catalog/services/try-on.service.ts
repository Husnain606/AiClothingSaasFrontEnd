import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { TryOnApiResponse, TryOnResult } from '../models/try-on.model';

@Injectable({ providedIn: 'root' })
export class TryOnService {
  constructor(private http: HttpClient) {}

  render(
    photo: File,
    garmentImageUrl: string,
    productId: string,
    productVariantId?: string
  ): Observable<TryOnResult> {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('garmentImageUrl', garmentImageUrl);
    formData.append('productId', productId);
    if (productVariantId) {
      formData.append('productVariantId', productVariantId);
    }

    return this.http
      .post<TryOnApiResponse<TryOnResult>>(`${environment.tryOnApiBaseUrl}/tryon`, formData)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message || 'Try-on render failed.');
          }
          return response.data;
        })
      );
  }
}
