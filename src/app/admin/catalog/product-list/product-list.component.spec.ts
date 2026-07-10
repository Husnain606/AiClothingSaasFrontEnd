import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { ProductSummaryDto } from '../models/catalog-admin.model';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let mockCatalog: Partial<CatalogAdminService>;
  let mockToast: Partial<ToastService>;

  const product: ProductSummaryDto = {
    id: 'p1',
    name: 'Jacket',
    slug: 'jacket',
    categoryId: 'c1',
    status: 'Draft',
    basePrice: 99,
    createdAt: '2026-07-01T00:00:00Z',
  };

  const product2: ProductSummaryDto = {
    id: 'p2',
    name: 'Trousers',
    slug: 'trousers',
    categoryId: 'c1',
    status: 'Active',
    basePrice: 49,
    createdAt: '2026-07-02T00:00:00Z',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockCatalog = {
      getProducts: vi.fn().mockReturnValue(of({ items: [product, product2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })),
      publishProduct: vi.fn().mockReturnValue(of({ ...product, status: 'Active' })),
      archiveProduct: vi.fn().mockReturnValue(of({ ...product, status: 'Archived' })),
      deleteProduct: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        { provide: CatalogAdminService, useValue: mockCatalog },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads products on init', () => {
    expect(component.rows.length).toBe(2);
  });

  it('renders exactly one table row per product (no duplicate rendering)', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(component.rows.length);
    expect(rows.length).toBe(2);
  });

  it('renders each product name exactly once in the DOM', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const jacketOccurrences = text.split('Jacket').length - 1;
    const trousersOccurrences = text.split('Trousers').length - 1;
    expect(jacketOccurrences).toBe(1);
    expect(trousersOccurrences).toBe(1);
  });

  it('publishes a product and reloads', () => {
    component.onPublish(product);
    expect(mockCatalog.publishProduct).toHaveBeenCalledWith('p1');
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('archives a product', () => {
    component.onArchive(product);
    expect(mockCatalog.archiveProduct).toHaveBeenCalledWith('p1');
  });

  it('opens the delete confirmation and deletes on confirm', () => {
    component.openDeleteModal(product);
    expect(component.deleteModalOpen).toBe(true);
    expect(component.productPendingDelete).toBe(product);
    component.onDeleteConfirmed();
    expect(mockCatalog.deleteProduct).toHaveBeenCalledWith('p1');
    expect(component.deleteModalOpen).toBe(false);
  });

  it('searches products', () => {
    (mockCatalog.getProducts as ReturnType<typeof vi.fn>).mockClear();
    component.onSearchChange('jacket');
    expect(mockCatalog.getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 20, search: 'jacket' });
  });
});
