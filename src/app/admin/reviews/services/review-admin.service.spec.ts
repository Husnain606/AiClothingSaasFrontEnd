import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { ReviewAdminService } from './review-admin.service';

describe('ReviewAdminService', () => {
  let service: ReviewAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReviewAdminService, ApiService],
    });
    service = TestBed.inject(ReviewAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets reviews filtered by status', () => {
    service.getReviews('Pending').subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/tenant/reviews` && r.params.get('status') === 'Pending'
    );
    req.flush(wrap({ items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 }));
  });

  it('gets all reviews when no status is given', () => {
    service.getReviews().subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/reviews`);
    expect(req.request.params.has('status')).toBe(false);
    req.flush(wrap({ items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 }));
  });

  it('approves a review', () => {
    service.approve('r1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/reviews/r1/approve`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('rejects a review with a reason', () => {
    service.reject('r1', 'Spam').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/reviews/r1/reject`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'Spam' });
    req.flush(wrap({}));
  });
});
