export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: { [key: string]: string[] } | null;
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
