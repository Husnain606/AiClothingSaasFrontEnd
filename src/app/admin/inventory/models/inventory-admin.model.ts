export type StockAdjustmentReason =
  | 'Restock'
  | 'Sale'
  | 'Correction'
  | 'Damage'
  | 'Return'
  | 'OrderPlaced'
  | 'OrderCancelled';

export interface StockAdjustRequest {
  variantId: string;
  delta: number; // positive or negative
  reason: StockAdjustmentReason;
}

export interface LowStockItem {
  variantId: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
}

export interface StockHistoryEntry {
  id: string;
  productVariantId: string;
  delta: number;
  reason: StockAdjustmentReason;
  resultingQuantity: number;
  adjustedByUserId: string;
  createdAt: string;
}
