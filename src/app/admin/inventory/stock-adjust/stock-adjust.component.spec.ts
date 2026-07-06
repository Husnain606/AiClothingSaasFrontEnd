import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StockAdjustComponent } from './stock-adjust.component';
import { InventoryAdminService } from '../services/inventory-admin.service';
import { ToastService } from '../../shared/services/toast.service';

describe('StockAdjustComponent', () => {
  let fixture: ComponentFixture<StockAdjustComponent>;
  let component: StockAdjustComponent;
  let mockInventory: Partial<InventoryAdminService>;
  let mockToast: Partial<ToastService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockInventory = {
      adjustStock: vi.fn().mockReturnValue(of(undefined)),
      getStockHistory: vi.fn().mockReturnValue(of([])),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [StockAdjustComponent],
      providers: [
        { provide: InventoryAdminService, useValue: mockInventory },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StockAdjustComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variantId', 'v1');
    fixture.detectChanges();
  });

  it('loads stock history for the variant', () => {
    expect(mockInventory.getStockHistory).toHaveBeenCalledWith('v1');
  });

  it('does not submit without a reason', () => {
    component.delta = 5;
    component.reason = '';
    component.onSubmit();
    expect(mockInventory.adjustStock).not.toHaveBeenCalled();
    expect(component.validationError).toBeTruthy();
  });

  it('does not submit with a zero delta', () => {
    component.delta = 0;
    component.reason = 'Damage';
    component.onSubmit();
    expect(mockInventory.adjustStock).not.toHaveBeenCalled();
    expect(component.validationError).toBeTruthy();
  });

  it('submits a valid adjustment', () => {
    component.delta = -3;
    component.reason = 'Damage';
    component.onSubmit();
    expect(mockInventory.adjustStock).toHaveBeenCalledWith({ variantId: 'v1', delta: -3, reason: 'Damage' });
    expect(mockToast.success).toHaveBeenCalled();
  });
});
