export interface SummaryReport {
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
  newCustomers: number;
  pendingReviews: number;
  lowStockCount: number;
}

export interface SalesPoint {
  periodStart: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  units: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  revenue: number;
}

export interface TopCustomer {
  customerId: string;
  email: string;
  totalSpend: number;
  orderCount: number;
}

export interface CustomerAnalytics {
  newCustomersOverTime: SalesPoint[];
  repeatPurchaseRate: number;
  topCustomers: TopCustomer[];
}

export interface LowStockItem {
  variantId: string;
  productName: string;
  sku: string;
  stockQuantity: number;
}

export interface InventoryTrends {
  adjustmentsOverTime: SalesPoint[];
  lowStock: LowStockItem[];
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  revenue: number;
  units: number;
}

export type ReportInterval = 'Day' | 'Week' | 'Month';

export interface ReportDateParams {
  from: string; // ISO yyyy-MM-dd
  to: string;
}
