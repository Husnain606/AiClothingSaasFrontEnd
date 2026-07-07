export type DiscountType = 'Percentage' | 'FixedAmount';

export interface DiscountDto {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number | null;
  maxRedemptions?: number | null;
  redemptionCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface DiscountRequest {
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number | null;
  maxRedemptions?: number | null;
  startsAt: string;
  endsAt: string;
}
