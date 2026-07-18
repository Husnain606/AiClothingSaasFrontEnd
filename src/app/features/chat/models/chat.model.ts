export interface ChatApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatProductContext {
  name: string;
  description: string;
  sizes: string[];
}

export interface ChatResult {
  reply: string;
}
