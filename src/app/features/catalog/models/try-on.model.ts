export interface TryOnApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface TryOnResult {
  resultImageDataUri: string;
}
