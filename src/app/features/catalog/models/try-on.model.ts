export interface TryOnApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: string[] | null;
}

/** 202 response from POST /tryon — the render runs in the background from here. */
export interface TryOnSubmitted {
  requestId: string;
}

/** GET /tryon/{id} — what the render eventually resolved to. */
export interface TryOnStatus {
  status: 'Processing' | 'Completed' | 'Failed';
  resultImageUrl: string | null;
  failureReason: string | null;
}
