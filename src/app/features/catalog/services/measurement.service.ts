import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MeasurementApiResponse, MeasurementResult } from '../models/measurement.model';

@Injectable({ providedIn: 'root' })
export class MeasurementService {
  constructor(private http: HttpClient) {}

  estimate(photo: File, heightCm?: number): Observable<MeasurementResult> {
    const formData = new FormData();
    formData.append('photo', photo);
    if (heightCm) {
      formData.append('heightCm', heightCm.toString());
    }

    return this.http
      .post<MeasurementApiResponse<MeasurementResult>>(
        `${environment.tryOnApiBaseUrl}/measure`,
        formData
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message || 'Measurement estimate failed.');
          }
          return response.data;
        })
      );
  }
}
