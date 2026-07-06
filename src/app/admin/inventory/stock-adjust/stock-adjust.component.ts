import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryAdminService } from '../services/inventory-admin.service';
import { StockAdjustmentReason, StockHistoryEntry } from '../models/inventory-admin.model';
import { ToastService } from '../../shared/services/toast.service';

export const STOCK_ADJUSTMENT_REASONS: StockAdjustmentReason[] = [
  'Restock',
  'Sale',
  'Correction',
  'Damage',
  'Return',
  'OrderPlaced',
  'OrderCancelled',
];

@Component({
  selector: 'app-stock-adjust',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-adjust.component.html',
})
export class StockAdjustComponent implements OnChanges {
  @Input({ required: true }) variantId!: string;

  readonly reasons = STOCK_ADJUSTMENT_REASONS;

  delta = 0;
  reason: StockAdjustmentReason | '' = '';
  validationError = '';
  history: StockHistoryEntry[] = [];

  constructor(
    private inventory: InventoryAdminService,
    private toast: ToastService
  ) {}

  ngOnChanges(): void {
    if (this.variantId) this.loadHistory();
  }

  private loadHistory(): void {
    this.inventory.getStockHistory(this.variantId).subscribe((history) => (this.history = history));
  }

  onSubmit(): void {
    if (!this.reason || this.delta === 0) {
      this.validationError = 'Enter a non-zero quantity and a reason.';
      return;
    }
    this.validationError = '';
    this.inventory.adjustStock({ variantId: this.variantId, delta: this.delta, reason: this.reason }).subscribe({
      next: () => {
        this.toast.success('Stock adjusted.');
        this.delta = 0;
        this.reason = '';
        this.loadHistory();
      },
      error: () => this.toast.error('Failed to adjust stock.'),
    });
  }
}
