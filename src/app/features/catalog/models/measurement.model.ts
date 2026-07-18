export interface MeasurementApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface MeasurementResult {
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  shoulderWidthCm: number;
  inseamCm: number;
  recommendedSize: string;
  confidence: number;
}
