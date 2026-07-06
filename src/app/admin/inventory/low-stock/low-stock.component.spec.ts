import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LowStockComponent } from './low-stock.component';
import { InventoryAdminService } from '../services/inventory-admin.service';

describe('LowStockComponent', () => {
  let fixture: ComponentFixture<LowStockComponent>;
  let component: LowStockComponent;
  let mockInventory: Partial<InventoryAdminService>;

  const items = [
    { variantId: 'v1', productId: 'p1', sku: 'SKU-1', size: 'M', color: 'Blue', stockQuantity: 2 },
    { variantId: 'v2', productId: 'p2', sku: 'SKU-2', size: 'L', color: 'Red', stockQuantity: 1 },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockInventory = { getLowStock: vi.fn().mockReturnValue(of(items)) };

    await TestBed.configureTestingModule({
      imports: [LowStockComponent],
      providers: [{ provide: InventoryAdminService, useValue: mockInventory }],
    }).compileComponents();
    fixture = TestBed.createComponent(LowStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads low-stock items with the default threshold', () => {
    expect(mockInventory.getLowStock).toHaveBeenCalledWith(5);
    expect(component.items.length).toBe(2);
  });

  it('renders exactly one table row per low-stock item', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(component.items.length);
  });

  it('reloads when the threshold changes', () => {
    (mockInventory.getLowStock as ReturnType<typeof vi.fn>).mockClear();
    component.onThresholdChange(10);
    expect(mockInventory.getLowStock).toHaveBeenCalledWith(10);
  });

  it('selects a variant to view its adjust/history panel', () => {
    component.onSelectVariant('v1');
    expect(component.selectedVariantId).toBe('v1');
  });
});
