import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { VariantTableComponent } from './variant-table.component';
import { CatalogAdminService } from '../services/catalog-admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { ProductVariantDto } from '../models/catalog-admin.model';

describe('VariantTableComponent', () => {
  let fixture: ComponentFixture<VariantTableComponent>;
  let component: VariantTableComponent;
  let mockCatalog: Partial<CatalogAdminService>;
  let mockToast: Partial<ToastService>;

  const variant: ProductVariantDto = {
    id: 'v1',
    productId: 'p1',
    sku: 'SKU-1',
    size: 'M',
    color: 'Red',
    priceOverride: 20,
    effectivePrice: 20,
    stockQuantity: 5,
    isActive: true,
    createdAt: '2026-07-01T00:00:00Z',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockCatalog = {
      getVariants: vi.fn().mockReturnValue(of([variant])),
      addVariant: vi.fn().mockReturnValue(of(variant)),
      updateVariant: vi.fn().mockReturnValue(of(variant)),
      deactivateVariant: vi.fn().mockReturnValue(of({ ...variant, isActive: false })),
      deleteVariant: vi.fn().mockReturnValue(of(undefined)),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VariantTableComponent],
      providers: [
        { provide: CatalogAdminService, useValue: mockCatalog },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VariantTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
  });

  it('loads variants for the given product', () => {
    expect(mockCatalog.getVariants).toHaveBeenCalledWith('p1');
    expect(component.variants.length).toBe(1);
  });

  it('adds a new variant from the form', () => {
    component.newVariant = { sku: 'SKU-2', size: 'L', color: 'Blue', stockQuantity: 10 };
    component.onAdd();
    expect(mockCatalog.addVariant).toHaveBeenCalledWith({ productId: 'p1', sku: 'SKU-2', size: 'L', color: 'Blue', stockQuantity: 10 });
  });

  it('deactivates a variant', () => {
    component.onDeactivate(variant);
    expect(mockCatalog.deactivateVariant).toHaveBeenCalledWith('v1');
  });

  it('deletes a variant', () => {
    component.onDelete(variant);
    expect(mockCatalog.deleteVariant).toHaveBeenCalledWith('v1');
  });
});
