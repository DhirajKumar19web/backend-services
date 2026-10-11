export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
