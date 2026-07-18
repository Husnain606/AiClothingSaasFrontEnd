import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeasurementService } from './measurement.service';
import { environment } from '../../../../environments/environment';

describe('MeasurementService', () => {
  let service: MeasurementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MeasurementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('posts multipart form data (photo + optional heightCm) to the measure endpoint', () => {
    const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });

    service.estimate(photo, 175).subscribe();

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/measure`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('heightCm')).toBe('175');
    req.flush({
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: {
        chestCm: 96,
        waistCm: 80,
        hipsCm: 100,
        shoulderWidthCm: 44,
        inseamCm: 78,
        recommendedSize: 'M',
        confidence: 0.82,
      },
      errors: null,
    });
  });

  it('emits the parsed measurement result on success', () => {
    const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    const next = vi.fn();
    const result = {
      chestCm: 96,
      waistCm: 80,
      hipsCm: 100,
      shoulderWidthCm: 44,
      inseamCm: 78,
      recommendedSize: 'M',
      confidence: 0.82,
    };

    service.estimate(photo).subscribe(next);

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/measure`);
    expect((req.request.body as FormData).has('heightCm')).toBe(false);
    req.flush({ isSuccess: true, statusCode: 200, message: 'Success', data: result, errors: null });

    expect(next).toHaveBeenCalledWith(result);
  });

  it('throws when the response has no data (failure envelope)', () => {
    const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    const error = vi.fn();

    service.estimate(photo).subscribe({ next: () => {}, error });

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/measure`);
    req.flush({ isSuccess: false, statusCode: 429, message: 'Quota exceeded.', data: null, errors: null });

    expect(error).toHaveBeenCalled();
  });
});
