import type { ApiResponseOptions, ApiErrorDetails } from "../types/index.js";

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly timestamp: string;

  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly error?: ApiErrorDetails;
  public readonly meta?: ApiResponseOptions<T>["meta"];

  private constructor(options: ApiResponseOptions<T>) {
    this.statusCode = options.statusCode;
    this.message = options.message ?? (options.statusCode < 400 ? "Success" : "Error");

    if (options.data !== undefined) {
      this.data = options.data;
    }

    if (options.error !== undefined) {
      this.error = options.error;
    }

    if (options.meta) {
      this.meta = options.meta;
    }

    this.success = options.statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(options: ApiResponseOptions<T>): ApiResponse<T> {
    return new ApiResponse(options);
  }

  static error<T = undefined>(options: ApiResponseOptions<T>): ApiResponse<T> {
    return new ApiResponse(options);
  }
}

