import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountService } from './account.service';
import { ApiService } from '../../../core/services/api.service';
import { CustomerProfile, Order, WishlistItem, ChangePasswordRequest } from '../models/account.model';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  let apiService: ApiService;

  const mockProfile: CustomerProfile = {
    userId: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    createdDate: new Date(),
    lastModifiedDate: new Date(),
  };

  const mockOrders: Order[] = [
    {
      orderId: 'ORD-001',
      orderDate: new Date(),
      items: [
        {
          productId: 'PROD-001',
          productName: 'T-Shirt',
          price: 29.99,
          quantity: 2,
          variant: { size: 'M', color: 'Blue' },
        },
      ],
      subtotal: 59.98,
      tax: 4.79,
      total: 64.77,
      status: 'delivered',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
    },
  ];

  const mockWishlist: WishlistItem[] = [
    {
      id: 'WISH-001',
      productId: 'PROD-001',
      productName: 'Jeans',
      price: 79.99,
      imageUrl: 'https://example.com/jeans.jpg',
      addedDate: new Date(),
      inStock: true,
    },
    {
      id: 'WISH-002',
      productId: 'PROD-002',
      productName: 'Jacket',
      price: 99.99,
      imageUrl: 'https://example.com/jacket.jpg',
      addedDate: new Date(),
      inStock: false,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountService, ApiService],
    });

    service = TestBed.inject(AccountService);
    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProfile', () => {
    it('should fetch customer profile successfully', () => {
      return new Promise<void>((resolve) => {
        service.getProfile().subscribe((profile) => {
          expect(profile.userId).toBe('123');
          expect(profile.firstName).toBe('John');
          expect(profile.email).toBe('john@example.com');
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/profile'));
        expect(req.request.method).toBe('GET');
        req.flush({ data: mockProfile });
      });
    });

    it('should handle profile fetch error', () => {
      return new Promise<void>((resolve) => {
        service.getProfile().subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(401);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) => request.url.includes('account/profile'));
        req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      });
    });

    it('should return profile with correct address details', () => {
      return new Promise<void>((resolve) => {
        service.getProfile().subscribe((profile) => {
          expect(profile.address.street).toBe('123 Main St');
          expect(profile.address.zipCode).toBe('10001');
          expect(profile.address.country).toBe('US');
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/profile'));
        req.flush({ data: mockProfile });
      });
    });
  });

  describe('updateProfile', () => {
    it('should update customer profile successfully', () => {
      return new Promise<void>((resolve) => {
        const updatedProfile = { firstName: 'Jane', lastName: 'Smith' };

        service.updateProfile(updatedProfile).subscribe((profile) => {
          expect(profile.firstName).toBe('John');
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/profile'));
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedProfile);
        req.flush({ data: mockProfile });
      });
    });

    it('should send correct request body for profile update', () => {
      return new Promise<void>((resolve) => {
        const updateData = {
          firstName: 'Jane',
          phone: '9876543210',
        };

        service.updateProfile(updateData).subscribe(() => {
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/profile'));
        expect(req.request.body.firstName).toBe('Jane');
        expect(req.request.body.phone).toBe('9876543210');
        req.flush({ data: mockProfile });
      });
    });

    it('should handle profile update error', () => {
      return new Promise<void>((resolve) => {
        service.updateProfile({ firstName: 'Jane' }).subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(400);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) => request.url.includes('account/profile'));
        req.flush(
          { message: 'Invalid profile data' },
          { status: 400, statusText: 'Bad Request' }
        );
      });
    });
  });

  describe('getOrders', () => {
    it('should fetch orders with default pagination', () => {
      return new Promise<void>((resolve) => {
        service.getOrders().subscribe((orders) => {
          expect(orders.length).toBe(1);
          expect(orders[0].orderId).toBe('ORD-001');
          expect(orders[0].status).toBe('delivered');
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes('store/orders') && request.params.has('pageNumber')
        );
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('pageNumber')).toBe('1');
        expect(req.request.params.get('pageSize')).toBe('10');
        req.flush({ data: { items: mockOrders } });
      });
    });

    it('should fetch orders with custom pagination', () => {
      return new Promise<void>((resolve) => {
        service.getOrders(2, 20).subscribe((orders) => {
          expect(orders.length).toBe(1);
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes('store/orders') && request.params.has('pageNumber')
        );
        expect(req.request.params.get('pageNumber')).toBe('2');
        expect(req.request.params.get('pageSize')).toBe('20');
        req.flush({ data: { items: mockOrders } });
      });
    });

    it('should handle orders fetch error', () => {
      return new Promise<void>((resolve) => {
        service.getOrders().subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(500);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) => request.url.includes('store/orders'));
        req.flush(
          { message: 'Internal server error' },
          { status: 500, statusText: 'Internal Server Error' }
        );
      });
    });

    it('should return empty array when no orders exist', () => {
      return new Promise<void>((resolve) => {
        service.getOrders().subscribe((orders) => {
          expect(orders.length).toBe(0);
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('store/orders'));
        req.flush({ data: { items: [] } });
      });
    });
  });

  describe('getOrderById', () => {
    it('should fetch single order by ID', () => {
      return new Promise<void>((resolve) => {
        const orderId = 'ORD-001';

        service.getOrderById(orderId).subscribe((order) => {
          expect(order.orderId).toBe('ORD-001');
          expect(order.total).toBe(64.77);
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes(`store/orders/${orderId}`)
        );
        expect(req.request.method).toBe('GET');
        req.flush({ data: mockOrders[0] });
      });
    });

    it('should handle order not found', () => {
      return new Promise<void>((resolve) => {
        service.getOrderById('INVALID-ID').subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(404);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) =>
          request.url.includes('store/orders/INVALID-ID')
        );
        req.flush({ message: 'Order not found' }, { status: 404, statusText: 'Not Found' });
      });
    });

    it('should include order items in response', () => {
      return new Promise<void>((resolve) => {
        service.getOrderById('ORD-001').subscribe((order) => {
          expect(order.items.length).toBe(1);
          expect(order.items[0].productName).toBe('T-Shirt');
          expect(order.items[0].quantity).toBe(2);
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('store/orders/ORD-001'));
        req.flush({ data: mockOrders[0] });
      });
    });
  });

  describe('getWishlist', () => {
    it('should fetch wishlist items successfully', () => {
      return new Promise<void>((resolve) => {
        service.getWishlist().subscribe((items) => {
          expect(items.length).toBe(2);
          expect(items[0].productName).toBe('Jeans');
          expect(items[1].productName).toBe('Jacket');
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        expect(req.request.method).toBe('GET');
        req.flush({ data: mockWishlist });
      });
    });

    it('should return empty array when no wishlist items', () => {
      return new Promise<void>((resolve) => {
        service.getWishlist().subscribe((items) => {
          expect(items.length).toBe(0);
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        req.flush({ data: null });
      });
    });

    it('should include product details in wishlist items', () => {
      return new Promise<void>((resolve) => {
        service.getWishlist().subscribe((items) => {
          expect(items[0].id).toBe('WISH-001');
          expect(items[0].productId).toBe('PROD-001');
          expect(items[0].price).toBe(79.99);
          expect(items[0].inStock).toBe(true);
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        req.flush({ data: mockWishlist });
      });
    });

    it('should handle wishlist fetch error', () => {
      return new Promise<void>((resolve) => {
        service.getWishlist().subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(500);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        req.flush(
          { message: 'Internal server error' },
          { status: 500, statusText: 'Internal Server Error' }
        );
      });
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', () => {
      return new Promise<void>((resolve) => {
        const productId = 'PROD-001';
        const newWishlistItem = mockWishlist[0];

        service.addToWishlist(productId).subscribe((item) => {
          expect(item.id).toBe('WISH-001');
          expect(item.productId).toBe(productId);
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        expect(req.request.method).toBe('POST');
        expect(req.request.body.productId).toBe(productId);
        req.flush({ data: newWishlistItem });
      });
    });

    it('should send correct request body when adding to wishlist', () => {
      return new Promise<void>((resolve) => {
        const productId = 'PROD-123';

        service.addToWishlist(productId).subscribe(() => {
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        expect(req.request.body).toEqual({ productId });
        req.flush({ data: mockWishlist[0] });
      });
    });

    it('should handle add to wishlist error', () => {
      return new Promise<void>((resolve) => {
        service.addToWishlist('INVALID-PROD').subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(400);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        req.flush(
          { message: 'Product not found' },
          { status: 400, statusText: 'Bad Request' }
        );
      });
    });

    it('should return wishlist item with product details', () => {
      return new Promise<void>((resolve) => {
        service.addToWishlist('PROD-002').subscribe((item) => {
          expect(item.productName).toBe('Jeans');
          expect(item.price).toBe(79.99);
          expect(item.imageUrl).toBeDefined();
          resolve();
        });

        const req = httpMock.expectOne((request) => request.url.includes('account/wishlist'));
        req.flush({ data: mockWishlist[0] });
      });
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist', () => {
      return new Promise<void>((resolve) => {
        const itemId = 'WISH-001';

        service.removeFromWishlist(itemId).subscribe(() => {
          expect(true).toBe(true);
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes(`account/wishlist/${itemId}`)
        );
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
      });
    });

    it('should handle remove from wishlist error', () => {
      return new Promise<void>((resolve) => {
        service.removeFromWishlist('INVALID-ID').subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(404);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) =>
          request.url.includes('account/wishlist/INVALID-ID')
        );
        req.flush({ message: 'Wishlist item not found' }, { status: 404, statusText: 'Not Found' });
      });
    });

    it('should pass correct item ID in URL', () => {
      return new Promise<void>((resolve) => {
        const itemId = 'WISH-123';

        service.removeFromWishlist(itemId).subscribe(() => {
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes(`account/wishlist/${itemId}`)
        );
        req.flush(null);
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      return new Promise<void>((resolve) => {
        const passwordRequest: ChangePasswordRequest = {
          currentPassword: 'oldPass123',
          newPassword: 'newPass456',
        };

        service.changePassword(passwordRequest).subscribe(() => {
          expect(true).toBe(true);
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes('auth/change-password')
        );
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(passwordRequest);
        req.flush(null);
      });
    });

    it('should send correct password data', () => {
      return new Promise<void>((resolve) => {
        const passwordRequest: ChangePasswordRequest = {
          currentPassword: 'current123',
          newPassword: 'future456',
        };

        service.changePassword(passwordRequest).subscribe(() => {
          resolve();
        });

        const req = httpMock.expectOne((request) =>
          request.url.includes('auth/change-password')
        );
        expect(req.request.body.currentPassword).toBe('current123');
        expect(req.request.body.newPassword).toBe('future456');
        req.flush(null);
      });
    });

    it('should handle password change error - incorrect old password', () => {
      return new Promise<void>((resolve) => {
        const passwordRequest: ChangePasswordRequest = {
          currentPassword: 'wrongPass',
          newPassword: 'newPass456',
        };

        service.changePassword(passwordRequest).subscribe(
          () => {},
          (error) => {
            expect(error.status).toBe(400);
            resolve();
          }
        );

        const req = httpMock.expectOne((request) =>
          request.url.includes('auth/change-password')
        );
        req.flush({ message: 'Incorrect old password' }, { status: 400, statusText: 'Bad Request' });
      });
    });
  });
});
