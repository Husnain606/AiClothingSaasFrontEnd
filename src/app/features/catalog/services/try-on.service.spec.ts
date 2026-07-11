import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TryOnService } from './try-on.service';
import { environment } from '../../../../environments/environment';

describe('TryOnService', () => {
  let service: TryOnService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(TryOnService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('posts multipart form data to the try-on microservice base URL', () => {
    const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });

    service.render(photo, 'https://cdn.example.com/garment.jpg', 'product-1', 'variant-1').subscribe();

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ isSuccess: true, statusCode: 200, message: 'Success', data: { resultImageDataUri: 'data:image/png;base64,abc' }, errors: null });
  });

  it('emits the result data URI on success', () => {
    const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    const next = vi.fn();

    service.render(photo, 'https://cdn.example.com/garment.jpg', 'product-1').subscribe(next);

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon`);
    req.flush({ isSuccess: true, statusCode: 200, message: 'Success', data: { resultImageDataUri: 'data:image/png;base64,xyz' }, errors: null });

    expect(next).toHaveBeenCalledWith({ resultImageDataUri: 'data:image/png;base64,xyz' });
  });

  it('throws when the response has no data (failure envelope)', () => {
    const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    const error = vi.fn();

    service.render(photo, 'https://cdn.example.com/garment.jpg', 'product-1').subscribe({ next: () => {}, error });

    const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon`);
    req.flush({ isSuccess: false, statusCode: 429, message: 'Quota exceeded.', data: null, errors: null });

    expect(error).toHaveBeenCalled();
  });
});
