import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryAdminService } from '../services/inventory-admin.service';
import { LowStockItem } from '../models/inventory-admin.model';
import { StockAdjustComponent } from '../stock-adjust/stock-adjust.component';

const DEFAULT_THRESHOLD = 5;

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, StockAdjustComponent],
  templateUrl: './low-stock.component.html',
})
export class LowStockComponent implements OnInit {
  items: LowStockItem[] = [];
  threshold = DEFAULT_THRESHOLD;
  selectedVariantId: string | null = null;

  constructor(private inventory: InventoryAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  onThresholdChange(threshold: number): void {
    this.threshold = threshold;
    this.load();
  }

  onSelectVariant(variantId: string): void {
    this.selectedVariantId = variantId;
  }

  private load(): void {
    this.inventory.getLowStock(this.threshold).subscribe((items) => (this.items = items));
  }
}
