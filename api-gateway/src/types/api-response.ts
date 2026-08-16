export interface Meta {
  requestId?: string | undefined;
  version?: string | undefined;
  executionTime?: number | undefined;
  [key: string]: unknown;
}

export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponseOptions<T = unknown> {
  statusCode: number;
  message?: string | undefined;
  data?: T | undefined;
  error?: ApiErrorDetails | undefined;
  meta?: Meta | undefined;
}

