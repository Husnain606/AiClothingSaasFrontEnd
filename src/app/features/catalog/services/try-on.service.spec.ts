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

  describe('submit', () => {
    it('posts multipart form data to the try-on microservice base URL', () => {
      const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });

      service.submit(photo, 'https://cdn.example.com/garment.jpg', 'product-1', 'variant-1').subscribe();

      const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ isSuccess: true, statusCode: 202, message: 'Queued', data: { requestId: 'req-1' }, errors: null });
    });

    it('emits the request id from the 202 envelope', () => {
      const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
      const next = vi.fn();

      service.submit(photo, 'https://cdn.example.com/garment.jpg', 'product-1').subscribe(next);

      const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon`);
      req.flush({ isSuccess: true, statusCode: 202, message: 'Queued', data: { requestId: 'req-42' }, errors: null });

      expect(next).toHaveBeenCalledWith({ requestId: 'req-42' });
    });

    it('throws when the response has no data (failure envelope)', () => {
      const photo = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
      const error = vi.fn();

      service.submit(photo, 'https://cdn.example.com/garment.jpg', 'product-1').subscribe({ next: () => {}, error });

      const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon`);
      req.flush({ isSuccess: false, statusCode: 429, message: 'Quota exceeded.', data: null, errors: null });

      expect(error).toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('GETs the per-request status endpoint', () => {
      service.getStatus('req-1').subscribe();

      const req = httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon/req-1`);
      expect(req.request.method).toBe('GET');
      req.flush({
        isSuccess: true,
        statusCode: 200,
        message: 'Success',
        data: { status: 'Processing', resultImageUrl: null, failureReason: null },
        errors: null,
      });
    });

    it('emits the completed status with its result URL', () => {
      const next = vi.fn();

      service.getStatus('req-1').subscribe(next);

      httpMock.expectOne(`${environment.tryOnApiBaseUrl}/tryon/req-1`).flush({
        isSuccess: true,
        statusCode: 200,
        message: 'Success',
        data: { status: 'Completed', resultImageUrl: 'https://space.hf.space/file=r.png', failureReason: null },
        errors: null,
      });

      expect(next).toHaveBeenCalledWith({
        status: 'Completed',
        resultImageUrl: 'https://space.hf.space/file=r.png',
        failureReason: null,
      });
    });

    it('throws when the status response has no data', () => {
      const error = vi.fn();

      service.getStatus('missing').subscribe({ next: () => {}, error });

      httpMock
        .expectOne(`${environment.tryOnApiBaseUrl}/tryon/missing`)
        .flush({ isSuccess: false, statusCode: 404, message: 'Try-on request not found.', data: null, errors: null });

      expect(error).toHaveBeenCalled();
    });
  });
});
