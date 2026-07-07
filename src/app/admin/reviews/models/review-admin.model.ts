export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ReviewDto {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  status: ReviewStatus;
  createdAt: string;
}
