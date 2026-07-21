import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { NotificationsAdminService } from './notifications-admin.service';
import { NotificationDto } from '../models/notification.model';

describe('NotificationsAdminService', () => {
  let service: NotificationsAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationsAdminService, ApiService],
    });
    service = TestBed.inject(NotificationsAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getPaged unwraps ApiResponse.data', () => {
    const page = {
      items: [{ id: 'n1', type: 'OrderPlaced', title: 't', message: 'm', entityName: 'Order', entityId: 'o1', isRead: false, createdAt: '' }] as NotificationDto[],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };

    let result: typeof page | undefined;
    service.getPaged({ page: 1, pageSize: 20 }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/tenant/notifications` && r.params.get('page') === '1' && r.params.get('pageSize') === '20'
    );
    req.flush(wrap(page));

    expect(result).toEqual(page);
  });

  it('gets unread count', () => {
    service.getUnreadCount().subscribe((count) => expect(count).toBe(3));
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/notifications/unread-count`).flush(wrap(3));
  });

  it('marks a single notification read', () => {
    service.markRead('n1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/notifications/n1/mark-read`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap(null));
  });

  it('marks all notifications read', () => {
    service.markAllRead().subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/notifications/mark-all-read`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap(null));
  });
});
