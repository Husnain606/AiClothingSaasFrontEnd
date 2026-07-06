import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';
import { ApiService } from '../../../core/services/api.service';
import { CatalogAdminService } from './catalog-admin.service';

describe('CatalogAdminService', () => {
  let service: CatalogAdminService;
  let httpMock: HttpTestingController;
  const wrap = <T>(data: T) => ({ statusCode: 200, message: 'ok', data, errors: null, timestamp: '' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogAdminService, ApiService],
    });
    service = TestBed.inject(CatalogAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets the category tree', () => {
    service.getCategoryTree().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories/tree`).flush(wrap([]));
  });

  it('gets flat categories', () => {
    service.getCategories().subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories`).flush(wrap([]));
  });

  it('creates a category', () => {
    service.createCategory({ name: 'Shoes', slug: 'shoes', parentCategoryId: null, sortOrder: 0 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories`);
    expect(req.request.method).toBe('POST');
    req.flush(
      wrap({
        id: 'c1',
        name: 'Shoes',
        slug: 'shoes',
        parentCategoryId: null,
        sortOrder: 0,
        isActive: true,
        createdAt: '',
      })
    );
  });

  it('updates a category', () => {
    service.updateCategory('c1', { name: 'Shoes', slug: 'shoes', sortOrder: 0, isActive: true }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories/c1`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap({}));
  });

  it('moves a category', () => {
    service.moveCategory('c1', 'c2').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories/c1/move`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ newParentId: 'c2' });
    req.flush(wrap({}));
  });

  it('reorders categories', () => {
    service.reorderCategories([{ id: 'c1', sortOrder: 0 }, { id: 'c2', sortOrder: 1 }]).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories/reorder`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      items: [
        { id: 'c1', sortOrder: 0 },
        { id: 'c2', sortOrder: 1 },
      ],
    });
    req.flush(wrap(null));
  });

  it('deletes a category', () => {
    service.deleteCategory('c1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/categories/c1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });

  it('gets a paged product list with optional search', () => {
    service.getProducts({ page: 1, pageSize: 20, search: 'jacket' }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/tenant/products` && r.params.get('search') === 'jacket'
    );
    req.flush(wrap({ items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 }));
  });

  it('creates a product', () => {
    service
      .createProduct({ name: 'Jacket', slug: 'jacket', description: 'd', categoryId: 'c1', basePrice: 99 })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('updates a product', () => {
    service
      .updateProduct('p1', { name: 'Jacket', slug: 'jacket', description: 'd', categoryId: 'c1', basePrice: 99 })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap({}));
  });

  it('publishes a product', () => {
    service.publishProduct('p1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1/publish`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('archives a product', () => {
    service.archiveProduct('p1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1/archive`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('deletes a product', () => {
    service.deleteProduct('p1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });

  it('gets variants for a product', () => {
    service.getVariants('p1').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1/variants`).flush(wrap([]));
  });

  it('adds a variant', () => {
    service.addVariant({ productId: 'p1', sku: 'SKU-1', size: 'M', color: 'Red', stockQuantity: 5 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/variants`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('updates a variant', () => {
    service.updateVariant('v1', { sku: 'SKU-1', size: 'M', color: 'Red', isActive: true }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/variants/v1`);
    expect(req.request.method).toBe('PUT');
    req.flush(wrap({}));
  });

  it('deactivates a variant', () => {
    service.deactivateVariant('v1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/variants/v1/deactivate`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap({}));
  });

  it('deletes a variant', () => {
    service.deleteVariant('v1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/variants/v1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });

  it('gets images for a product', () => {
    service.getImages('p1').subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1/images`).flush(wrap([]));
  });

  it('uploads an image as multipart form data', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    service.uploadImage('p1', file).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/images`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(wrap({}));
  });

  it('reorders images', () => {
    service.reorderImages('p1', ['i1', 'i2']).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/p1/images/reorder`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ ids: ['i1', 'i2'] });
    req.flush(wrap(null));
  });

  it('sets an image as primary', () => {
    service.setPrimaryImage('i1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/images/i1/set-primary`);
    expect(req.request.method).toBe('POST');
    req.flush(wrap(null));
  });

  it('deletes an image', () => {
    service.deleteImage('i1').subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/tenant/products/images/i1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(wrap(null));
  });
});
